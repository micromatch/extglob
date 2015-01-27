function matchExtGlob(pattern, text, options, casePattern, patternPos, textPos) {
  //console.log('matchExtGlob', pattern, text, options, casePattern, patternPos, textPos);
  //console.log('             ' + pattern.slice(patternPos || 0), text.slice(textPos || 0));
  var extglob = parseList(pattern, patternPos + 1, '|', '(', ')', true);
  if (!extglob) {
    // The parenthesis not correctly closed. Treat the end of the pattern as a literal
    if (pattern.slice(patternPos) === text.slice(textPos)) return wildmatch.WM_MATCH;
    return wildmatch.WM_NOMATCH;
  }

  var extGlobType = pattern[patternPos];
  var initialPos = patternPos;
  patternPos = extglob.patternPos + 1;

  /**
   * These can match 0 time. Directly try this before more complex options
   */

  if (extGlobType === '*' || extGlobType === '?' || extGlobType === '!') {
    if (imatch(pattern, text, options, casePattern, patternPos, textPos) === wildmatch.WM_MATCH) {
      return wildmatch.WM_MATCH;
    }
  }

  var extglobs = extglob.items;
  var extglobsCase = parseList(casePattern, initialPos + 1, '|', '(', ')', true).items;
  var extglobsLength = extglobs.length;

  var textPosStart = textPos;
  textPos++;

  if (false && extGlobType !== '*' && extGlobType !== '+') {
    var specialChars = {
      '[': true,
      '?': true,
      '*': true,
      '+': true,
      '@': true,
      '!': true
    };
    if (options.brace) specialChars['{'] = true;

    if (!(pattern[patternPos] in specialChars)) {
      // If the next char in the pattern is a literal, we can skip all the char in the text until we found it
      var nextLiteral = (pattern[patternPos] === '\\') ? pattern[patternPos + 1] : pattern[patternPos];
    }
    if (!pattern[patternPos]) textPos = text.length;
  }

  for (var textLength = text.length; textPos <= textLength; ++textPos) {
    if (nextLiteral) {
      var pos = text.indexOf(nextLiteral, textPos);
      if (pos === -1) {
        return wildmatch.WM_NOMATCH;
      }
      textPos = pos;
    }

    var extGlobText = text.slice(textPosStart, textPos);

    var match;
    for (var i = 0; i < extglobsLength; ++i) {
      var extGlobPattern = extglobs[i];
      var extGlobCasePattern = extglobsCase[i];
      match = imatch(extGlobPattern, extGlobText, options, extGlobCasePattern);
      if (match === wildmatch.WM_MATCH) break;
    }
    if ((extGlobType === '!') === (match === wildmatch.WM_MATCH)) continue;

    match = imatch(pattern, text, options, casePattern, patternPos, textPos);
    if (match === wildmatch.WM_MATCH) return match;

    if (extGlobType === '*' || extGlobType === '+') {
      if (imatch(pattern, text, options, casePattern, initialPos, textPos) === wildmatch.WM_MATCH) {
        return wildmatch.WM_MATCH;
      }
    }
  }

  return wildmatch.WM_NOMATCH;
}