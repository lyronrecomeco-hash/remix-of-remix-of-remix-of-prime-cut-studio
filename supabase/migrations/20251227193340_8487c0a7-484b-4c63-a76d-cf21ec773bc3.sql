-- Blindagem da fila: impedir reentrada/retrocesso e garantir remoção ao concluir

-- 1) Remover duplicados (se existirem) para permitir índice único
DELETE FROM public.queue q
USING public.queue q2
WHERE q.appointment_id = q2.appointment_id
  AND q.created_at < q2.created_at;

-- 2) Garantir 1 registro de fila por agendamento
CREATE UNIQUE INDEX IF NOT EXISTS queue_unique_appointment_id
ON public.queue (appointment_id);

-- 3) Ao concluir/cancelar agendamento, remover automaticamente da fila
CREATE OR REPLACE FUNCTION public.cleanup_queue_on_appointment_done()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.status IN ('completed', 'cancelled') THEN
    DELETE FROM public.queue
    WHERE appointment_id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_cleanup_queue_on_appointment_done ON public.appointments;
CREATE TRIGGER trg_cleanup_queue_on_appointment_done
AFTER UPDATE OF status ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.cleanup_queue_on_appointment_done();

-- 4) Impedir regressão de status na fila (called/onway -> waiting)
CREATE OR REPLACE FUNCTION public.prevent_queue_status_regression()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF (TG_OP = 'UPDATE') THEN
    IF NEW.status IS DISTINCT FROM OLD.status
       AND NEW.status = 'waiting'
       AND OLD.status IN ('called', 'onway') THEN
      RAISE EXCEPTION 'Queue status cannot regress to waiting';
    END IF;
  END IF;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_prevent_queue_status_regression ON public.queue;
CREATE TRIGGER trg_prevent_queue_status_regression
BEFORE UPDATE OF status ON public.queue
FOR EACH ROW
EXECUTE FUNCTION public.prevent_queue_status_regression();
