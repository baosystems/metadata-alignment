import React, { useState } from 'react'
import PropTypes from 'prop-types'
import { Button, InputField } from '@dhis2/ui'

const ThresholdInput = ({ extMatchThresh, extSetMatchThresh }) => {
  const [matchThreshold, setMatchThreshold] = useState(extMatchThresh)
  return (
    <div>
      <label htmlFor="matchThreshold" className="threshLabel">
        Match threshold
      </label>
      <div className="matchThreshold">
        <InputField
          name="matchThreshold"
          value={matchThreshold}
          onChange={(e) => setMatchThreshold(e.value)}
          inputWidth="50px"
          // helpText="Value between 0 and 1 to autofill mappings, lower values match more strictly"
        />
        <Button primary onClick={() => extSetMatchThresh(matchThreshold)}>
          Update suggestions
        </Button>
      </div>
      <p className="threshDescription">
        A value between 0 and 1 to determine auto matching, lower values require
        a closer match
      </p>
    </div>
  )
}

ThresholdInput.propTypes = {
  extMatchThresh: PropTypes.string,
  extSetMatchThresh: PropTypes.func.isRequired,
}

export default ThresholdInput
