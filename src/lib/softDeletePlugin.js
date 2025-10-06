import mongoose from "mongoose";

// Use mongoose.Schema to access Schema
const { Schema } = mongoose;

const softDeletePlugin = (schema, options = {}) => {
    schema.add({
        isDeleted: { type: Boolean, default: false },
        deletedAt: { type: Date },
        deletedBy: { type: Schema.Types.ObjectId, ref: "User" }, // optional
        deleteReason: { type: String }
    });

    // Soft Delete Method
    schema.methods.softDelete = async function (deletedBy = null, reason = null) {
        this.isDeleted = true;
        this.deletedAt = new Date();
        if (deletedBy) this.deletedBy = deletedBy;
        if (reason) this.deleteReason = reason;
        await this.save();
    };

    // Restore Method
    schema.methods.restore = async function () {
        this.isDeleted = false;
        this.deletedAt = null;
        this.deletedBy = null;
        this.deleteReason = null;
        await this.save();
    };

    // Default query filter
    schema.pre(/^find/, function (next) {
        if (!this.getFilter().includeDeleted) {
            this.find({ isDeleted: { $ne: true } });
        }
        next();
    });

    // Handle aggregate queries
    schema.pre('aggregate', function (next) {
        const firstStage = this.pipeline()[0];
        if (!firstStage || !firstStage.$match?.includeDeleted) {
            this.pipeline().unshift({ $match: { isDeleted: { $ne: true } } });
        }
        next();
    });

    // Static helpers
    schema.statics.findDeleted = function () {
        return this.find({ isDeleted: true });
    };

    // Index for performance
    schema.index({ isDeleted: 1, deletedAt: 1 });
};

export default softDeletePlugin;
