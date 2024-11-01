import { IsEmail } from "class-validator";

export class User {
  id?: number;

  name: string;

  @IsEmail()
  email: string;

  messages?: string[] | string;
  number?: string;
  
  createdAt?: Date;
}

export class comStandard{
  status: number;   
  message: string;      
  data: User[] | User;
}