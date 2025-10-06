import DevBuildError from "../lib/DevBuildError.js";
import { generateUniqueSlug } from "../lib/utilityFunction.js";
import Tags from "../models/Tags.js";

// ✅ Create Tags
export const tagStore = async (req, res, next) => {
    try {
        const { tag } = req.body;
        const slug = await generateUniqueSlug(Tags, tag);
        await new Tags({ tag, slug }).save();
        res.status(201).json({ message: "Tag Created Successfully" });
    } catch (error) {
        next(error);
    }
};


// ✅ Get All Tags
export const getAllTags = async (req, res, next) => {
    try {
        const tags = await Tags.find({ status: "active" }).sort({ createdAt: -1 }).limit(10);
        res.status(200).json(tags);
    } catch (error) {
        next(error);
    }
};

// ✅ Get Single Tags
export const getSingleTags = async (req, res, next) => {
    try {
        const { slug } = req.params;
        // console.log(slug);
        const tag = await Tags.findOne({ slug });
        res.status(200).json(tag);
    } catch (error) {
        next(error);
    }
}


// ✅ Update Tags
export const updateTags = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const { tag } = req.body;

        const existingTag = await Tags.findOne({ slug });
        if (!existingTag) throw new DevBuildError("Tag not found", 404);

        const newSlug = tag ? await generateUniqueSlug(Tags, tag) : existingTag.slug;

        await Tags.updateOne({ slug }, { tag, slug: newSlug });

        res.status(200).json({ message: "Tag Updated Successfully" });
    } catch (error) {
        next(error);
    }
};



// ✅ Delete Tags
export const deleteTags = async (req, res, next) => {
    try {
        const { slug } = req.params;
        const tag = await Tags.findOne({ slug });

        if (!tag) {
            throw new DevBuildError('Tags not found', 404);
        }

        // Soft delete the Tags
        await tag.softDelete();
        res.status(200).json({ message: "Tags Deleted Successfully" });

    } catch (error) {
        next(error);
    }
}