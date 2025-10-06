export const generateSlug = (text) => {
    return text
        .toString()
        .normalize('NFD')                   
        .replace(/[\u0300-\u036f]/g, '')    
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')       
        .replace(/\s+/g, '-')             
        .replace(/-+/g, '-')                
        .replace(/^-+|-+$/g, '');         
};


export const generateUniqueSlug = async (model, name) => {
    let slug = generateSlug(name);
    let existingRecord = await model.findOne({ slug });
    let suffix = 1;
    while (existingRecord) {
        slug = `${generateSlug(name)}-${suffix}`;
        existingRecord = await model.findOne({ slug });
        suffix++;
    }
    return slug;
}
