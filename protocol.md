packet structure (json)

{
    type: "Packet type",
    data: {
        "key": "value"
    }
}

packet types

serverbound
login
    
    {
        type: "login",
        data: {
            "username": "username",
            "password": "password"
        }
    }

signup

    {
        type: "signup",
        data: {
            "username": "username",
            "password": "password"
        }
    }

position

    {
        type: "position",
        data: {
            "x": 0,
            "y": 0,
        }
    }

mapData

    {
        type: "mapData",
        data: {
            "mapX": 0,
            "mapY": 0,
        }
    }

leaderboard

    {
        type: "leaderboard",
        data: {
            
        }
    }


clientbound
login

    {
        type: "login",
        data: {
            "success": true,
            "userData": {
                "name": "username",
                "id": "uuid",
                position: {
                    x: 0,
                    y: 0,
                    mapX: 0,
                    mapY: 0
                },
            }
        }
    }

    {
        type: "login",
        data: {
            "success": false,
            "reason": "reason"
        }
    }

signup

    {
        type: "signup",
        data: {
            "success": false,
            "reason": "reason"
        }
    }

players

    {
        type: "players",
        data: {
            "players": [
                {
                    "name": "username",
                    "id": "uuid",
                    position: {
                        x: 0,
                        y: 0,
                        mapX: 0,
                        mapY: 0
                    },
                }
            ]
        }
    }

playerJoin

    {
        type: "playerJoin",
        data: {
            "userData": {
                "name": "username",
                "id": "uuid",
            }
        }
    }

playerLeave

    {
        type: "playerLeave",
        data: {
            "userData": {
                "name": "username",
                "id": "uuid",
            }
        }
    }

mapData

    {
        type: "mapData",
        data: {
            "mapX": 0,
            "mapY": 0,
            "startPosX": 0,
            "startPosy": 0,
            "mapData": {
                "walls": [
                    {
                        "x": 0,
                        "y": 0,
                        "w": 0,
                        "h": 0,
                        "color": "color",
                        type: "wallType"
                    }
                ],
                signs [
                    {
                        "x": 0,
                        "y": 0,
                        "text": "",
                        "font": "30px Arial",
                        "color": "color"
                    }
                ]
            }
        }
    }

leaderboard

    {
        type: "leaderboard",
        data: {
            "leaderboard": [
                {
                    "name": "username",
                    "score": 0
                }
            ]
        }
    }

