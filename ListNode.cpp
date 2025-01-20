// ListNode.cpp

#include "ListNode.h"

// Explicit template instantiations for ListNode
template class ListNode<int>;
template class ListNode<double>;
template class ListNode<string>;

// Explicit template instantiations for DoubleListNode
template class DoubleListNode<int>;
template class DoubleListNode<double>;
template class DoubleListNode<string>;

// Explicit template instantiations for TreeNode
template class TreeNode<int>;
template class TreeNode<double>;
template class TreeNode<string>;

// Explicit template instantiations for string to array or matrix
vector<int> stringToIntArray(const string&);
vector<double> stringToDoubleArray(const string&); 
vector<string> stringToStringArray(const string&);
vector<vector<int>> stringToIntMatrix(const string&);
vector<vector<double>> stringToDoubleMatrix(const string&);
vector<vector<string>> stringToStringMatrix(const string&);
// Explicit template instantiations for arrayToLinkedList
template ListNode<int>* arrayToLinkedList<int>(const vector<int>&);
template ListNode<double>* arrayToLinkedList<double>(const vector<double>&);
template ListNode<string>* arrayToLinkedList<string>(const vector<string>&);

// Explicit template instantiations for arrayToDoubleLinkedList
template DoubleListNode<int>* arrayToDoubleLinkedList<int>(const vector<int>&);
template DoubleListNode<double>* arrayToDoubleLinkedList<double>(const vector<double>&);
template DoubleListNode<string>* arrayToDoubleLinkedList<string>(const vector<string>&);

// Explicit template instantiations for arrayToTree
template TreeNode<int>* arrayToTree<int>(const vector<int>&);
template TreeNode<double>* arrayToTree<double>(const vector<double>&);
template TreeNode<string>* arrayToTree<string>(const vector<string>&);

// Explicit template instantiations for tree traversal functions
template vector<int> inorderTraversal<int>(TreeNode<int>*);
template vector<double> inorderTraversal<double>(TreeNode<double>*);
template vector<string> inorderTraversal<string>(TreeNode<string>*);

template vector<int> preorderTraversal<int>(TreeNode<int>*);
template vector<double> preorderTraversal<double>(TreeNode<double>*);
template vector<string> preorderTraversal<string>(TreeNode<string>*);

template vector<int> postorderTraversal<int>(TreeNode<int>*);
template vector<double> postorderTraversal<double>(TreeNode<double>*);
template vector<string> postorderTraversal<string>(TreeNode<string>*);

// Explicit template instantiations for print functions
template void printLinkedList<int>(ListNode<int>*);
template void printLinkedList<double>(ListNode<double>*);
template void printLinkedList<string>(ListNode<string>*);

template void printDoubleLinkedList<int>(DoubleListNode<int>*);
template void printDoubleLinkedList<double>(DoubleListNode<double>*);
template void printDoubleLinkedList<string>(DoubleListNode<string>*);

template void printTree<int>(TreeNode<int>*, string);

template void printArray<int>(const vector<int>&);
template void printArray<double>(const vector<double>&);
template void printArray<string>(const vector<string>&);
