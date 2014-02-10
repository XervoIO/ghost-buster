// Credits: http://stackoverflow.com/questions/6843441/javascript-how-can-i-replace-only-nth-match-in-the-string

module.exports = function customReplace(strData, strTextToReplace, strReplaceWith, replaceAt) {
  var index = strData.indexOf(strTextToReplace);
  for (var i = 1; i < replaceAt; i++)
    index = strData.indexOf(strTextToReplace, index + 1);
  if (index >= 0)
    return strData.substr(0, index) + strReplaceWith + strData.substr(index + strTextToReplace.length, strData.length);
  return strData;
};