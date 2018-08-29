const columns = [...Array(100)].map((e, i) => {
  return { name: 'col-' + i, width: 120 }
})

const data = [...Array(30)].map((e, i) => {
  return columns.reduce((prev, f, j) => {
    return {
      ...prev,
      [f.name]: i + ',' + j
    }
  }, {})
})

export { columns, data }
