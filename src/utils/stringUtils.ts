    /**
     * @description Compose strings based on conditions passed as an array (tuple). If condition pass, string at second index would be chained.
     * @param conds An array (tuple) of conditions - at first index is condition, at second string to chain if condition is true.
     * @param initStr Initial string that starts sequence of characters. Chained strings are added at the end one after the other.
     * @param separator Separator used between chained strings. Defautls to space.
     * @result Composed string.
     */
export const composeStrBool = (conds: [boolean, string][], initStr = "", separator = " "): string => {
        let resultStr = initStr

        for (const [cond, str] of conds) {
            if (cond) resultStr += separator + str
        }

        return resultStr
    }