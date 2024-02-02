import bcrypt from 'bcrypt';
import { faker } from '@faker-js/faker';
import { User } from './user';
import { Address } from './address';

export const createFakeUser = async (user: Partial<User>, i?: number) => {
  const n = i ? i : 0;

  return {
    name: user.name ?? 'Name ' + faker.person.middleName() + ' ' + faker.person.lastName(),
    email: user.email ?? 'newuser' + n + '@taq.com',
    password: await bcrypt.hash(user.password ?? 'senhaforte0' + n, 2),
    birthDate: user.birthDate ?? faker.date.birthdate().toString(),
  };
};

export const createFakeAddress = async (address: Partial<Address>, i?: number) => {
  const n = i ? i : 0;

  return {
    postalCode: address.postalCode ?? '011' + n,
    street: address.street ?? 'Rua ' + n,
    streetNumber: address.streetNumber ?? n.toString(),
    complement: address.complement ?? '',
    neighborhood: address.neighborhood ?? 'Centro',
    city: address.city ?? 'Sao Paulo',
    state: address.state ?? 'SP',
  };
};

