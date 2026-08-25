export type CompanyType = {
  id: string;
  name: string;
};

export type RegisterTenantPayload = {
  firstName: string;
  lastName: string;
  email: string;
  companyName: string;
  companyType: string;
  companyPhone: string;
  companyLocation: string;
};
