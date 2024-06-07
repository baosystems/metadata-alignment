import Fuse from 'fuse.js'

function chunkArray(array, chunkSize) {
  let results = [];
  for (let i = 0; i < array.length; i += chunkSize) {
      results.push(array.slice(i, i + chunkSize));
  }
  return results;
}

self.onmessage = (event) => {
  if (event.data.type === 'suggestions') {
    const { source, target, mappingType } = event.data.input
    let result = []
    if (mappingType === 'deCoc') {
      result = createSimilarityMatrixDeCocs(source, target)
    } else {
      result = createSimilarityMatrix(source, target)
    }
    const entries = Object.entries(result)
    const chunkSize = mappingType === 'deCoc' ? 10 : 500
    const chunks = chunkArray(entries, chunkSize)
    for (const chunk of chunks) {
      self.postMessage(JSON.stringify(Object.fromEntries(chunk)))
    }
    self.postMessage(`COMPLETE ${mappingType}`)
  }
}

function createSimilarityMatrixDeCocs(sourceDes, targetDes) {
  const idNmMap = createIdNmMap(sourceDes, targetDes)
  const sourceCocs = idNmArrayFromMap(idNmMap.sourceCocsMap)
  const targetCocs = idNmArrayFromMap(idNmMap.targetCocsMap)
  const srcDeIdNmMap = idNmMap.sourceDesMap
  const srcCocIdNmMap = idNmMap.sourceCocsMap
  const deSuggestions = makeRankedSuggestions(sourceDes, targetDes, srcDeIdNmMap)
  const cocSuggestions = makeRankedSuggestions(sourceCocs, targetCocs, srcCocIdNmMap)
  const result = {
    ...deSuggestions,
    ...cocSuggestions,
  }
  return result
}

function createSimilarityMatrix(source, target) {
  const sourceIdNameMap = {}
  const targetIdNameMap = {}

  for (const { id, name } of source) {
    sourceIdNameMap[id] = name
  }

  for (const { id, name } of target) {
    targetIdNameMap[id] = name
  }

  const sourceArr = idNmArrayFromMap(sourceIdNameMap)
  const targetArr = idNmArrayFromMap(targetIdNameMap)

  return {
    ...makeRankedSuggestions(sourceArr, targetArr, sourceIdNameMap),
  }
}

function makeRankedSuggestions(sourceIdNmArr, targetIdNmArr, srcIdNmMap) {
  const fuseOpts = {
    includeScore: true,
    shouldSort: true,
    isCaseSensitive: true,
    threshold: 1.0,
    findAllMatches: true,
    ignoreLocation: true,
    keys: ['abcName'],
  }
  const srcIdLetterifiedNmMap = letterifyObjValues(srcIdNmMap)
  const sourceIds = sourceIdNmArr.map(({ id }) => id)
  const tgtIdNms = targetIdNmArr.map(({ id, name }) => ({
    id,
    name,
    abcName: letterifyString(name),
  }))
  const fuseMatcher = new Fuse(tgtIdNms, fuseOpts)
  const simtrix = {}
  for (const id of sourceIds) {
    const orderedSimilarities = fuseMatcher.search(srcIdLetterifiedNmMap[id])
    simtrix[id] = orderedSimilarities.map((deMatch) => ({
      id: deMatch.item.id,
      name: deMatch.item.name,
      abcName: deMatch.item.abcName,
      score: deMatch.score,
    }))
  }
  return simtrix
}

function createIdNmMap(sourceDes, targetDes) {
  const sourceDesMap = {}
  const targetDesMap = {}
  const sourceCocsMap = {}
  const targetCocsMap = {}
  for (const de of sourceDes) {
    sourceDesMap[de.id] = de.name
    for (const coc of de.categoryCombo.categoryOptionCombos) {
      if (!(coc in sourceCocsMap)) {
        sourceCocsMap[coc.id] = coc.name
      }
    }
  }
  for (const de of targetDes) {
    targetDesMap[de.id] = de.name
    for (const coc of de.categoryCombo.categoryOptionCombos) {
      if (!(coc in targetCocsMap)) {
        targetCocsMap[coc.id] = coc.name
      }
    }
  }
  return { sourceDesMap, targetDesMap, sourceCocsMap, targetCocsMap }
}

// Replace numbers and special characters with letters to help
// the fuse module match mostly numeric fields better
function letterifyString(s) {
  // Make male and female disaggregations more divergent
  const diverged = s.replace('Female', 'XXXXX')
  return diverged
    .split('')
    .map((c) => nonLetterMap[c] || c)
    .join('')
}

function letterifyObjValues(obj) {
  const result = {}
  for (const key in obj) {
    result[key] = letterifyString(obj[key])
  }
  return result
}

function idNmArrayFromMap(idNameMap) {
  const result = []
  for (const id in idNameMap) {
    result.push({ id, name: idNameMap[id] })
  }
  return result
}

const nonLetterMap = {
  0: 'aaaaa',
  1: 'bbbbb',
  2: 'ccccc',
  3: 'ddddd',
  4: 'eeeee',
  5: 'fffff',
  6: 'ggggg',
  7: 'hhhhh',
  8: 'iiiii',
  9: 'jjjjj',
  '-': 'kkkkk',
  '+': 'lllll',
  '<': 'mmmmm',
  '>': 'nnnnn',
  ',': 'ooooo',
}
