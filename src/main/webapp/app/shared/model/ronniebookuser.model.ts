interface Authority {
  name: string;
}

export interface User {
  id: string;
  login: string;
  authorities: Authority[];
  activated: boolean;
}
