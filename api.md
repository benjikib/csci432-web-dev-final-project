# API Documentation 

## Committees 
| URL Slug | Method | Details | Auth Required? |
| --- | --- | --- | --- |
| /committees | GET | Gets the details of every committee. | Yes |
| /committee/:id: | GET | Gets the details of a specific committee. | Yes |
| /committee/create | POST | Creates a specific committee. | Yes |

## Motions 
> BASE_URL: /committee/:id:/

| URL Slug | Method | Details | Auth Required? |
| --- | --- | --- | --- |
| /BASE_URL/motions | GET | Gets all of the motions for a specified committee. | Yes | 
| /BASE_URL/motion/:id: | GET | Gets the details of a specific motion in a specific committee. | Yes | 
| /BASE_URL/motion/create | POST | Creates a specific motion within a committee. | Yes | 
| /BASE_URL/motion/:id:/comments/:page: | GET | Gets the comments of a specific motion. | Yes | 
| /BASE_URL/motion/:id:/vote | GET | Gets the votes of a specific motion. | Yes | 


