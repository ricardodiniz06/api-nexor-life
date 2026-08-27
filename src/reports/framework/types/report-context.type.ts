/** Contexto de execução passado a cada provider (auditoria, escopo futuro). */
export type ReportContext = {
  userId: string;
  requestedAt: Date;
};
