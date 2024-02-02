import { dataSource } from '../data-source';
import { User } from '../user';
import { Address } from '../address';
import { UserInput } from '../resolvers';
import { createFakeAddress, createFakeUser } from '../fake-data-generator';

const user0: UserInput = {
    name: 'Authenticated User',
    email: 'taq@gmail.com',
    password: 'senhafort3',
    birthDate: '01-01-2024',
};

const user1: UserInput = {
    name: 'Other User',
    email: 'taq9@gmail.com',
    password: 'senhafort321',
    birthDate: '09-09-1914',
};

afterEach(async () => {
    await dataSource.getRepository(Address).delete({});
    await dataSource.getRepository(User).delete({});
});

describe('Testing address relation', () => {
    it('should save 2 users with 2 addresses each, associating addresses to users', async () => {
        const addr0 = await dataSource.getRepository(Address).save(
            await createFakeAddress({
                city: 'Natal',
                state: 'RN'
            })
        );
        const addr1 = await dataSource.getRepository(Address).save(
            await createFakeAddress({
                complement: 'Apartamento 1',
            }, 10)
        );
        const addr2 = await dataSource.getRepository(Address).save(
            await createFakeAddress({
                street: 'Avenida Central',
                neighborhood: 'Nova Fortaleza',
                city: 'Fortaleza',
                state: 'CE'
            }, 25)
        );
        const addr3 = await dataSource.getRepository(Address).save(
            await createFakeAddress({}, 243)
        );

        const newUser0 = await dataSource.getRepository(User).save(
            Object.assign(await createFakeUser(user0), { address: [addr1, addr3] })
        );

        const newUser1 = await dataSource.getRepository(User).save(
            Object.assign(await createFakeUser(user1), { address: [addr0, addr2] })
        );
    });

    it('should save 1 user with 2 addresses, associating user to addresses', async () => {
        const user = await dataSource.getRepository(User).save(
            await createFakeUser({})
        );

        const addr0 = await dataSource.getRepository(Address).save(
            Object.assign(await createFakeAddress({ city: 'Salvador', state: 'BA' }, 29), { user: user })
        );
        
        const addr1 = await dataSource.getRepository(Address).save(
            Object.assign(await createFakeAddress({ street: 'Avenida', city: 'Cuiabá', state: 'MT'}, 52), { user: user })
        );
    });
});
