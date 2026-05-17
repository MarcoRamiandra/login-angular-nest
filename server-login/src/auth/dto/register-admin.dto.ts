import { IsEmail, IsString, MinLength, IsIn } from 'class-validator';

export class RegisterAdminDto {
    @IsEmail()
    email!: string;

    @IsString()
    @MinLength(6)
    password!: string;

    @IsIn(['admin', 'user'])
    role!: 'admin' | 'user';
}