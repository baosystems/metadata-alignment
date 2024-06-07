import Worker from 'worker-loader!./suggestion.worker.js' // eslint-disable-line

export default function spawnSuggestionWorker(source, target, mappingType) {
  return new Promise((resolve) => {
    const worker = new Worker()
    let result = {}

    worker.postMessage({
      type: 'suggestions',
      input: { source, target, mappingType },
    })

    worker.onmessage = ({ data }) => {
      if (data.slice(0, 8) === 'COMPLETE') {
        console.log('Recieved data chunk:', data)
        worker.terminate()
        return resolve(result)
      }
      const parsed = JSON.parse(data)
      result = {...result, ...parsed}
    }
  })
}
