"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getUsers = void 0;
const getUsers = (req, res) => {
    const users = [
        { id: 1, name: 'Jane Doe', email: 'jane@example.com' },
        { id: 2, name: 'John Smith', email: 'john@example.com' }
    ];
    res.json({
        success: true,
        data: {
            users,
            totalCount: users.length
        },
        timestamp: new Date().toISOString()
    });
};
exports.getUsers = getUsers;
