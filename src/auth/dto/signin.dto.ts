import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

export class SignInDTO {
  @IsEmail()
  @IsNotEmpty()
  email: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}

export const signInDtoStub = () => {
  return {
    email: 'testemail@test.com',
    password: 'QWERTqwert123@',
  };
};
