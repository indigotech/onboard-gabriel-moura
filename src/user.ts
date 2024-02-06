import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from 'typeorm';
import { Address } from './address';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  @Column()
  email: string;

  @Column()
  password: string;

  @Column()
  birthDate: string;

  @OneToMany(() => Address, (address) => address.user, { cascade: true })
  address: Address[];
}

export interface UserInput {
  name: string;
  email: string;
  password: string;
  birthDate: string;
}
