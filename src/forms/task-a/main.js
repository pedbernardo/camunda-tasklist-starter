import sample from '../../js/components/sample'

function HelloWorld () {
  const result = sample(1, 5)

  console.log(`hello world: ${result}`)
}

window.HelloWorld = HelloWorld
// console.log(HelloWorld)
