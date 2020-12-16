export interface Person {
  full_name: string;
  email: string;
  city: string;
  department: string;
}

export type Insert = Person;

export interface Select extends Partial<Person> {
  startRow?: number;
}

export interface Update extends Partial<Person> {
  id: number;
}

export interface Record extends Person {
  id: number;
}

export type Colombia = { [K: string]: string[] };
