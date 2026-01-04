# Genesis FASE 8: Sistema de Backup de Sessão

## Resumo
Sistema completo de backup e restore versionado de sessões WhatsApp, permitindo recuperação automática após falhas de VPS.

## Componentes Implementados

### 1. Banco de Dados

#### Tabela `genesis_session_backups`
```sql
- id: UUID (PK)
- instance_id: UUID (FK -> genesis_instances)
- storage_path: TEXT (caminho no Storage)
- file_size_bytes: BIGINT
- checksum: TEXT (SHA-256)
- backup_type: TEXT ('automatic', 'manual', 'pre_disconnect', 'scheduled')
- session_metadata: JSONB
- version: INTEGER (versionamento incremental)
- is_valid: BOOLEAN
- restored_at, restored_by: controle de restauração
- expires_at: TIMESTAMP (default 30 dias)
```

#### Colunas adicionadas em `genesis_instances`
- `last_backup_id`: Referência ao último backup
- `last_backup_at`: Timestamp do último backup
- `backup_enabled`: Boolean para habilitar/desabilitar

### 2. Storage

#### Bucket `genesis-sessions`
- Privado (public: false)
- Limite: 50MB por arquivo
- MIME types: zip, gzip, octet-stream

### 3. Funções SQL

- `genesis_get_latest_backup(instance_id)`: Retorna último backup válido
- `genesis_create_backup_record(...)`: Cria registro + path único
- `genesis_mark_backup_restored(backup_id)`: Marca como restaurado
- `genesis_cleanup_old_backups(instance_id, keep_count)`: Mantém últimos N

### 4. Edge Function

#### `genesis-session-backup`
Actions:
- `create_backup`: Cria registro e retorna URL de upload assinada
- `upload_complete`: Confirma upload e atualiza instância
- `get_latest`: Busca último backup com URL de download
- `restore`: Valida backup e retorna URL de download
- `list_backups`: Lista backups disponíveis

### 5. VPS Script v8.0

#### Novos métodos em InstanceManager
- `backupSession(instanceId)`: Compacta auth_info, calcula SHA-256, faz upload
- `restoreSession(instanceId, backupId?)`: Baixa, verifica checksum, extrai
- `listBackups(instanceId)`: Lista backups disponíveis

#### Novos endpoints da API
- `POST /api/instance/:id/backup`: Criar backup
- `POST /api/instance/:id/restore`: Restaurar sessão
- `GET /api/instance/:id/backups`: Listar backups

#### Auto-restore no startup
O `autoConnectAll()` agora verifica se existe backup remoto antes de conectar instâncias sem sessão local.

## Fluxo de Operação

### Backup Automático
1. VPS compacta pasta `auth_<instanceId>` em ZIP
2. Calcula SHA-256 do arquivo
3. Chama Edge Function para obter URL de upload assinada
4. Faz upload para Storage
5. Confirma upload para registrar na instância

### Restore Automático
1. Ao iniciar, verifica se pasta local existe
2. Se não, busca último backup válido
3. Baixa arquivo do Storage
4. Verifica integridade via SHA-256
5. Extrai para pasta de auth
6. Conecta normalmente

## RLS Policies

- Super admins: acesso total
- Usuários: SELECT/INSERT apenas nas suas instâncias
- Storage: upload/download restrito a usuários Genesis

## Próximas Fases

- **FASE 9**: Pool de VPS (gerenciamento distribuído)
- **FASE 10**: Métricas e alertas avançados
