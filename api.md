# API Documentation 

## Committees 
| URL Slug | Method | Details | Auth Required? |
| --- | --- | --- | --- |
| /committees | GET | Gets the details of every committee. | Yes |
| /committee/:id: | GET | Gets the details of a specific committee. | Yes |
| /committee/create | POST | Creates a specific committee. | Yes |

## Motions 
| URL Slug | Method | Details | Auth Required? |
| --- | --- | --- | --- |
| /committee/:id:/motions | GET | Gets all of the motions for a specified committee. | Yes | 
| /committee/:id:/motiondetails/:id: | GET | Gets the details of a specific motion in a specific committee. | Yes | 
| /committee/:id:/motion/create | POST | Creates a specific motion within a committee. | Yes | 



