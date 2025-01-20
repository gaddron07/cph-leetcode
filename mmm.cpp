#include <iostream>
#include <sstream>
#include <vector>
#include <string>
#include <cctype>
#include <algorithm>

// Helper function to trim spaces from the string
std::string trim(const std::string &str) {
    size_t start = str.find_first_not_of(" \t\n\r");
    size_t end = str.find_last_not_of(" \t\n\r");
    return (start == std::string::npos) ? "" : str.substr(start, end - start + 1);
}

// Function to convert a string to an array of integers
std::vector<int> stringToIntArray(const std::string& str) {
    std::vector<int> arr;
    std::string temp;
    size_t i = 0;
    while (i < str.size()) {
        if (str[i] == ',') {
            i++;
            continue;
        }
        
        // Capture a number until we encounter a comma or closing bracket
        while (i < str.size() && (std::isdigit(str[i]) || str[i] == '-' || str[i] == '.')) {
            temp += str[i];
            i++;
        }

        if (!temp.empty()) {
            try {
                arr.push_back(std::stoi(temp));  // Convert to integer
            } catch (const std::invalid_argument& e) {
                std::cerr << "Invalid integer format: " << temp << std::endl;
            }
        }
        temp.clear();
        i++;
    }
    return arr;
}

// Function to convert a string to an array of floating-point numbers (double)
std::vector<double> stringToDoubleArray(const std::string& str) {
    std::vector<double> arr;
    std::string temp;
    size_t i = 0;
    while (i < str.size()) {
        if (str[i] == ',') {
            i++;
            continue;
        }
        
        while (i < str.size() && (std::isdigit(str[i]) || str[i] == '-' || str[i] == '.')) {
            temp += str[i];
            i++;
        }

        if (!temp.empty()) {
            try {
                arr.push_back(std::stod(temp));  // Convert to double
            } catch (const std::invalid_argument& e) {
                std::cerr << "Invalid double format: " << temp << std::endl;
            }
        }
        temp.clear();
        i++;
    }
    return arr;
}

// Function to convert a string to an array of strings
std::vector<std::string> stringToStringArray(const std::string& str) {
    std::vector<std::string> arr;
    std::string temp;
    size_t i = 0;
    while (i < str.size()) {
        if (str[i] == ',') {
            i++;
            continue;
        }
        
        // Capture a string until we encounter a comma or closing bracket
        while (i < str.size() && str[i] != ',' && str[i] != ']') {
            temp += str[i];
            i++;
        }

        if (!temp.empty()) {
            arr.push_back(trim(temp));  // Add trimmed string
        }
        temp.clear();
        i++;
    }
    return arr;
}

// Function to process a matrix string into a vector of vectors of specific type
template <typename T>
std::vector<std::vector<T>> processMatrix(const std::string& matrixString, 
                                          std::vector<T> (*converter)(const std::string&)) {
    std::vector<std::vector<T>> matrix;
    
    // Step 1: Remove the outer brackets and any unwanted spaces
    std::string content = matrixString.substr(1, matrixString.size() - 2);  // Remove outer brackets
    content = trim(content);  // Trim leading/trailing spaces from entire content

    // Step 2: Split by "],[" to get each row
    size_t start = 0;
    size_t end = content.find("],[");

    while (end != std::string::npos) {
        std::string rowStr = content.substr(start, end - start);
        matrix.push_back(converter(rowStr));  // Convert and add to matrix
        start = end + 3;  // Move past the "],[" separator
        end = content.find("],[" , start);
    }

    // Handle the last row (after the final "],[" or after the first row)
    if (start < content.size()) {
        std::string rowStr = content.substr(start);
        matrix.push_back(converter(rowStr));  // Convert and add to matrix
    }

    return matrix;
}

// Helper function to print an integer matrix
void printIntMatrix(const std::vector<std::vector<int>>& matrix) {
    for (const auto& row : matrix) {
        for (int val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
}

// Helper function to print a double matrix
void printDoubleMatrix(const std::vector<std::vector<double>>& matrix) {
    for (const auto& row : matrix) {
        for (double val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
}

// Helper function to print a string matrix
void printStringMatrix(const std::vector<std::vector<std::string>>& matrix) {
    for (const auto& row : matrix) {
        for (const std::string& val : row) {
            std::cout << val << " ";
        }
        std::cout << std::endl;
    }
}

int main() {
    // Example matrix input strings
    std::string intMatrixString = "[[1, 2, 3],[4, 5, 6],[7, 8, 9]]";
    std::string doubleMatrixString = "[[1.1, 2.2, 3.3],[4.4, 5.5, 6.6],[7.7, 8.8, 9.9]]";
    std::string stringMatrixString = "[[apple, banana, cherry],[dog, cat, elephant]]";

    // Process the matrix strings
    std::vector<std::vector<int>> intMatrix = processMatrix(intMatrixString, stringToIntArray);
    std::vector<std::vector<double>> doubleMatrix = processMatrix(doubleMatrixString, stringToDoubleArray);
    std::vector<std::vector<std::string>> stringMatrix = processMatrix(stringMatrixString, stringToStringArray);

    // Print the matrices
    std::cout << "Integer Matrix: " << std::endl;
    printIntMatrix(intMatrix);

    std::cout << "Double Matrix: " << std::endl;
    printDoubleMatrix(doubleMatrix);

    std::cout << "String Matrix: " << std::endl;
    printStringMatrix(stringMatrix);

    return 0;
}
