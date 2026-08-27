import { type PermissionAction } from '../../../iam/authorization/enums/permission-action.enum';
import { type PermissionResource } from '../../../iam/authorization/enums/permission-resource.enum';
import { type ReportFilterFieldType } from './report-filter-field.type';

export type ReportColumnType = 'string' | 'number' | 'boolean' | 'date';

/** Metadados declarativos de um relatório — equivalente ao EntityListConfig das listagens. */
export type ReportColumn = {
  key: string;
  label: string;
  type?: ReportColumnType;
};

export type ReportFilterField = {
  type: ReportFilterFieldType;
  /** Descrição para documentação OpenAPI. */
  description?: string;
};

export type ReportDefinition = {
  /** Identificador único na URL: GET /reports/:key */
  key: string;
  name: string;
  description: string;
  permission: {
    resource: PermissionResource;
    action: PermissionAction;
  };
  columns: ReportColumn[];
  /** Filtros permitidos (`filter=state:SP,isActive:true`). */
  filterFields?: Record<string, ReportFilterField>;
  /** Aceita `from` e `to` (ISO 8601) sobre `created_at` ou campo do provider. */
  supportsDateRange?: boolean;
};
