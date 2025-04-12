import * as R from 'ramda'; 

const stringToArray = R.split("");

/* Question 1 */
export const countVowels = (sentence:string) : number => {
    const vowels = new Set(['a','e','o','u','i', 'A' ,'E','I','O','U']);
    return R.pipe (
        stringToArray , 
        R.filter((char: string) => vowels.has(char)), // we get rid of the letters that are not vowels
        R.length // the length now is all the vowels in the sentence
    )(sentence);
}

/* Question 2 */
export const isPaired = (text: string): boolean => {
    
    const Check = (SubStr: string, brackets: string): boolean => { // this method check the brackets order 
        if (SubStr === "" && brackets !== "") {// If the input is empty but we still have open brackets
            return false;
        }
        if (SubStr === "") { // If the input is empty and we have no open brackets left
            return true;
        }
        if (SubStr[0] === "[" || SubStr[0] === "{" || SubStr[0] === "(") { // If we find an opening bracket, add it to the stack and continue
            return Check(SubStr.slice(1), brackets + SubStr[0]);
        }
        if (SubStr[0] === "}") {
            if (brackets[brackets.length - 1] === "{") { // If we find a closing curly bracket, check for a matching opening one
                return Check(SubStr.slice(1), brackets.slice(0, -1));
            } else {
                return false;
            }
        }
        if (SubStr[0] === ")") {
            if (brackets[brackets.length - 1] === "(") { // If we find a closing parenthesis, check for a matching opening one
                return Check(SubStr.slice(1), brackets.slice(0, -1));
            } else {
                return false;
            }
        }
        if (SubStr[0] === "]") {  // If we find a closing square bracket, check for a matching opening one
            if (brackets[brackets.length - 1] === "[") {
                
                return Check(SubStr.slice(1), brackets.slice(0, -1));
            } else {
                return false;
            }
        }// If it's not a bracket, just continue checking the rest of the string
        
        return Check(SubStr.slice(1), brackets);
    };

    // Start the recursive check with the given text and an empty stack of brackets
    return Check(text, "");
};



/* Question 3 */
export type WordTree = {
    root: string;
    children: WordTree[];
}

export const treeToSentence = (tree : WordTree) : string => {
    
    return treeToSentence2(tree,"",0).slice(1); 
}
const treeToSentence2 = (tree: WordTree, sentence: string, index: number): string => {

    let temp = sentence + " " + tree.root; // we first add the root of the tree we are in 

    if (tree.children.length != 0 && index < tree.children.length) { // if the tree has children we add them starting from the left child
        let child_left = treeToSentence2(tree.children[index], temp, index);
        if (index + 1 < tree.children.length) { // then we add the rest of the children
            return treeToSentence2(tree.children[index + 1], child_left , index);
        }
        return child_left;
    }

    return temp;
}


