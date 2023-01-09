import Worker from 'worker-loader!./suggestion.worker.js' // eslint-disable-line

export default function spawnSuggestionWorker(source, target, mappingType) {
  return new Promise((resolve) => {
    const worker = new Worker()

    worker.postMessage({
      type: 'suggestions',
      input: { source, target, mappingType },
    })

    worker.onmessage = ({ data }) => {
      const parsed = JSON.parse(data)
      worker.terminate()
      return resolve(parsed)
    }
  })
}
