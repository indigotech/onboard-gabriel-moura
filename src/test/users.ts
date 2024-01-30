import axios from 'axios';
import { sign } from 'jsonwebtoken';
import { dataSource } from '../data-source';
import { User } from '../user';
import { UserInput } from '../resolvers';
import { expect } from 'chai';
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

    it('should return list of users succesfully', async () => {

        await populateDb();

        const res = await axios({
            url: 'http://localhost:3000',
            method: 'post',
            headers: {
                Authorization: token,
            },
            data: {
                query: `
                    query Query($maxUsers: Int, $step: Int) {
                        users(maxUsers: $maxUsers, step: $step) {
                            users {
                                id
                                name
                                email
                                birthDate
                            }
                            totalUsers
                            before
                            after
                        }
                    }
                    variables: {
                        maxUsers: 5,
                        step: 0,
                    },
                `
            },
        });

        console.log(res);
    });
});

const populateDb = async () => {
    const users = [];
    for (let i = 0; i < 100; i++) {
        const user = await createFakeUser(i);
        users.push(user);
    }
    
    await dataSource.getRepository(User).save(users);
};

