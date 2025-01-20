import ast
from collections import deque

class ListNode:
    def __init__(self, val=0, next=None):
        self.val = val
        self.next = next

class DoubleListNode:
    def __init__(self, val=0, next=None, prev=None):
        self.val = val
        self.next = next
        self.prev = prev

class TreeNode:
    def __init__(self, val=0, left=None, right=None):
        self.val = val
        self.left = left
        self.right = right

def parse_input(input_data):
    return [ast.literal_eval(line) if line.strip() else line.strip() for line in input_data]

def conversion_to_list(arg):
    return ast.literal_eval(arg) if isinstance(arg, str) else list(arg)

def stringToInt(arg):
    return int(arg)

def stringToDouble(arg):
    return float(arg)

def array_to_linked_list(arr):
    dummy = ListNode()
    current = dummy
    for value in arr:
        current.next = ListNode(value)
        current = current.next
    return dummy.next

def array_to_double_linked_list(arr):
    dummy = DoubleListNode()
    current = dummy
    for value in arr:
        node = DoubleListNode(value)
        current.next = node
        node.prev = current
        current = node
    return dummy.next

def array_to_tree(arr):
    if not arr:
        return None
    root = TreeNode(arr[0])
    queue = deque([root])
    i = 1
    while queue and i < len(arr):
        node = queue.popleft()
        if arr[i] is not None:
            node.left = TreeNode(arr[i])
            queue.append(node.left)
        i += 1
        if i < len(arr) and arr[i] is not None:
            node.right = TreeNode(arr[i])
            queue.append(node.right)
        i += 1
    return root

def traversal_inorder(root):
    return traversal_inorder(root.left) + [root.val] + traversal_inorder(root.right) if root else []

def traversal_preorder(root):
    return [root.val] + traversal_preorder(root.left) + traversal_preorder(root.right) if root else []

def traversal_postorder(root):
    return traversal_postorder(root.left) + traversal_postorder(root.right) + [root.val] if root else []

def print_linked_list(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    print("Empty List" if not values else f"[{', '.join(map(str, values))}]")

def print_double_linked_list(head):
    values = []
    while head:
        values.append(head.val)
        head = head.next
    print("Empty List" if not values else f"[{', '.join(map(str, values))}]")

def print_tree(root, traversal_type="inorder"):
    if traversal_type == "preorder":
        result = traversal_preorder(root)
    elif traversal_type == "inorder":
        result = traversal_inorder(root)
    elif traversal_type == "postorder":
        result = traversal_postorder(root)
    else:
        print(f"Unsupported traversal type: {traversal_type}")
        return
    print(f"[{', '.join(map(str, result))}]")
