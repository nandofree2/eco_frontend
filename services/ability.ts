import { PureAbility, AbilityBuilder, AbilityClass } from '@casl/ability';

export type Action = 'manage' | 'create' | 'read' | 'update' | 'destroy' | 'see_menu' | string;
export type Subject = 'all' | 'Product' | 'Category' | 'UnitOfMeasurement' | 'User' | 'Role' | 'Dashboard' | 'Province' | 'City' | 'Branch' | 'Tenant' | 'Customer' | 'StockProduct' | 'AdjustmentProduct' | string;

export interface RawRule {
  action: Action[];
  subject: Subject[];
}

export type AppAbility = PureAbility<[Action, Subject]>;
export const AppAbility = PureAbility as AbilityClass<AppAbility>;

/**
 * Creates an empty ability instance.
 * Aliases allow 'manage' to cover all other specific actions.
 */
export const ability = new AppAbility([], {
  detectSubjectType: (item) => {
    if (typeof item === 'string') return item as Subject;
    return (item as any).__type;
  },
});

// Define Aliases: manage covers everything
// Note: We use the functional approach for CASL update rather than static aliases if we want deep control,
// but for standard CanCanCan, simple expansion works best.
export const parseRules = (rawRules: any) => {
  const { can, rules } = new AbilityBuilder(AppAbility);

  if (Array.isArray(rawRules)) {
    // Legacy Array Format: [{ action: [], subject: [] }]
    rawRules.forEach((rule) => {
      const actions = Array.isArray(rule.action) ? rule.action : [rule.action];
      const subjects = Array.isArray(rule.subject) ? rule.subject : [rule.subject];
      
      actions.forEach((action: Action) => {
        subjects.forEach((subject: Subject) => {
          can(action, subject);
        });
      });
    });
  } else if (rawRules && typeof rawRules === 'object') {
    // New Object Format: { Subject: [Actions] }
    Object.entries(rawRules).forEach(([subject, actions]) => {
      if (Array.isArray(actions)) {
        actions.forEach((action: any) => {
          can(action as Action, subject as Subject);
        });
      }
    });
  }

  return rules;
};
