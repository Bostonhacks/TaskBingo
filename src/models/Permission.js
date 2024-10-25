const { Schema, model } = require('mongoose');

// Schema for user permissions
const permissionSchema = new Schema({
    boardName: {
        type: String,
        required: true,
    },
    gridSize: {
        type: Number,
        required: true,
    },
    assignedRoles: {
        type: [String],
        required: true,
      },
});

// module.exports = model('Permission', permissionSchema);

const getPermissionModel = (connection) => {
    return connection.model('Permission', permissionSchema);
  };
  
module.exports = getPermissionModel