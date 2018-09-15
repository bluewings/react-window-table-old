const columns = [...Array(100)].map((e, i) => ({
  name: `col-${i}`,
  width: 120,
}));

const data = [...Array(30)].map((e, i) =>
  columns.reduce(
    (prev, f, j) => ({
      ...prev,
      [f.name]: `${i},${j}`,
    }),
    {},
  ));

export { columns, data };
