import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { dataSource } from '../data-source';
import { User } from '../user';
import { UserInput } from '../resolvers';
import { expect, use } from 'chai';
import chaiSorted from 'chai-sorted'; 
import { createFakeUser } from '../seed';

const authenticatedUser: UserInput = {
    name: 'Authenticated User',
    email: 'taq@gmail.com',
    password: 'senhafort3',
    birthDate: '01-01-2024',
};
  
describe('Testing users list query', () => {

    let token: string;

    beforeEach(async () => {
        token = sign(
            { email: authenticatedUser.email },
            process.env.JWT_SECRET as string
        );
    });

    afterEach(async () => {
        await dataSource.getRepository(User).delete({});
    });

    it('should return list of users succesfully, maximum default (10)', async () => {

        const n_dbUsers = 20;
        const users = [];

        for (let i = 0; i < n_dbUsers; i++) {
            const user = await createFakeUser(i);
            users.push(user);
        }

        await dataSource.getRepository(User).save(users);

        const res = await usersResponse(token);
        
        expect(res.data.data.users.length).to.be.equal(10);

        use(chaiSorted);
        expect(res.data.data.users).to.be.sortedBy('name');

    });

    it('should return list of users succesfully, passing arg max users', async () => {

        const n_dbUsers = 20;
        const maxUsers = 5;
        const users = [];
      
        for (let i = 0; i < n_dbUsers; i++) {
            const user = await createFakeUser(i);
            users.push(user);
        }

        await dataSource.getRepository(User).save(users);

        const res = await usersResponse(token, maxUsers);
        
        expect(res.data.data.users.length).to.be.equal(maxUsers);

        use(chaiSorted);
        expect(res.data.data.users).to.be.sortedBy('name');

    });

    it('should return list of all users on db succesfully', async () => {

        const n_dbUsers = 10;
        const maxUsers = 15;
        const users = [];
      
        for (let i = 0; i < n_dbUsers; i++) {
            const user = await createFakeUser(i);
            users.push(user);
        }

        await dataSource.getRepository(User).save(users);

        const res = await usersResponse(token, maxUsers);
        
        expect(res.data.data.users.length).to.be.equal(users.length);

        use(chaiSorted);
        expect(res.data.data.users).to.be.sortedBy('name');

    });

    it('should return empty list: max users 0', async () => {

        const n_dbUsers = 10;
        const maxUsers = 0;
        const users = [];
      
        for (let i = 0; i < n_dbUsers; i++) {
            const user = await createFakeUser(i);
            users.push(user);
        }

        await dataSource.getRepository(User).save(users);

        const res = await usersResponse(token, maxUsers);
        
        expect(res.data.data.users).to.be.empty;

    });

    it('should return empty list: no users on db', async () => {

        const maxUsers = 10;

        const res = await usersResponse(token, maxUsers);
        
        expect(res.data.data.users).to.be.empty;

    });

    it('should return auth error: invalid token', async () => {

        const n_dbUsers = 20;
        const users = [];

        for (let i = 0; i < n_dbUsers; i++) {
            const user = await createFakeUser(i);
            users.push(user);
        }

        await dataSource.getRepository(User).save(users);

        const res = await usersResponse(token + 'invalid_token');
        
        expect(res.data.errors[0].code).to.be.equal(401);
        expect(res.data.errors[0].message).to.be.equal('Erro de autenticação');
        expect(res.data.errors[0].additionalInfo).to.be.equal('Token inválido');

    });
});

const usersResponse = (async (token: string, maxUsers?: number) => {
    
    const res = await axios({
        url: 'http://localhost:3000',
        method: 'post',
        headers: {
            Authorization: token,
        },
        data: {
            query: `
                query Users($maxUsers: Int) {
                    users(maxUsers: $maxUsers) {
                        id
                        name
                        email
                        birthDate
                    }
                }
            `,
            variables: {
                maxUsers: maxUsers,
            }
        },
    });

    return res;
});