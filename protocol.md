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
            "playerData": {
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
            "success": true,
            "playerData": {
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
            "player": {
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

playerLeave

    {
        type: "playerLeave",
        data: {
            "player": {
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

mapData

    {
        type: "mapData",
        data: {
            "mapX": 0,
            "mapY": 0,
            "mapData": {
                "walls": [
                    {
                        "x": 0,
                        "y": 0,
                        "width": 0,
                        "height": 0,
                        "color": "color",
                        type: "wallType"
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
