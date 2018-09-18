import faker from 'faker';

const generate = index => ({
  id: index,
  avatar: faker.image.avatar(),
  city: faker.address.city(),
  email: faker.internet.email(),
  firstName: faker.name.firstName(),
  lastName: faker.name.lastName(),
  street: faker.address.streetName(),
  zipCode: faker.address.zipCode(),
  date: faker.date.past(),
  bs: faker.company.bs(),
  catchPhrase: faker.company.catchPhrase(),
  companyName: faker.company.companyName(),
  words: faker.lorem.words(),
  sentence: faker.lorem.sentence(),
});

const getFakeData = (size = 1000) => {
  const rows = new Array(size).fill(true).map((e, i) => generate(i));
  const columns = Object.keys(rows[0]);
  return { columns, rows };
};

const fakeUsers = getFakeData();

const { columns, rows } = fakeUsers;

export default fakeUsers;

export { columns, rows, getFakeData };
