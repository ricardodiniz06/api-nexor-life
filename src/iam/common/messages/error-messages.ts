/** Mensagens de erro IAM em português (API Nexor Life). */
export const IamErrorMessages = {
  auth: {
    /** Mensagem genérica — evita revelar se o e-mail existe (LGPD/segurança). */
    invalidCredentials: 'E-mail ou senha inválidos.',
    accountDisabled: 'Conta desativada. Contacte o administrador do hospital.',
    accountLocked:
      'Conta temporariamente bloqueada por tentativas inválidas. Tente novamente mais tarde.',
    refreshTokenRequired: 'Token de atualização é obrigatório.',
    refreshTokenInvalid: 'Token de atualização inválido ou expirado.',
    refreshTokenExpired: 'Sessão expirada. Faça login novamente.',
  },
  authorization: {
    missingUser: 'Sessão inválida. Faça login novamente.',
    insufficientPermissions: 'Não tem permissão para aceder a este recurso.',
    insufficientRole: 'Perfil de acesso insuficiente.',
  },
  users: {
    notFound: 'Utilizador não encontrado.',
    notFoundAfterCreate: 'Erro ao criar utilizador. Tente novamente.',
    emailInUse: 'Este e-mail já está registado.',
    cpfInUse: 'Este CPF já está registado.',
    rolesNotFound: 'Um ou mais perfis (papéis) não existem.',
    emptyUpdate:
      'Envie pelo menos um campo para atualizar (e-mail, senha, perfil, papéis, etc.).',
    cannotDeleteSelf: 'Não é possível remover a própria conta.',
    cannotEditOthers: 'Não pode editar outro utilizador.',
    cannotViewOthers: 'Não pode consultar outro utilizador.',
    adminOnlyFields:
      'Apenas administrador pode alterar papéis, estado da conta ou 2FA.',
  },
} as const;
