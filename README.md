# todos-app-backend

## Requirements:
1. Users can add, edit, delete and fetch their own ‘todos’.  
2. Users can make a comment to the todo. (check 5 and 6 for restrictions.)  
a. Only the owner of the comment can delete or update the comment.  
3. Users can like or dislike the todo. (check 5 and 6 for restrictions.)  
4. Each todo can be marked as ‘complete’.  
a. Todo has 2 status: complete or incomplete  
5. A user can share todos with other users.  
a. Only the owner of todo and shared users can fetch the todo.  
6. One user cannot access the todos of another if todos are not shared with them.  
7. Todos can be sorted by creation date.  
8. Todos can be sorted by the number of likes or the number of dislikes.  
9. Shared users of the todo can be listed.  
10. Users can filter the todos by their status. (complete or incomplete)  
11. Admin user can also do the followings:  
a. There is only one admin user.  
b. Can list the top 3 users that have the most incomplete todos.  
c. Can list the top 5 todos that have the most comments.  
d. Can list the top 3 todos that have the most number of likes.  
## Technical Details:
1. Use JWT for authentication and authorization.  
2. Follow the REST convention to build the server application.  
3. Backend API requests are logged.
4. Use MongoDB as a database server.