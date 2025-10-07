import Ticket from "../models/Ticket.js";



// ✅ Create Ticket
export const createTicket = async (req, res, next) => {
    try {

        const user = req.user;
        const { email, phone, message } = req.body;

        const newTicket = new Ticket({
            userId: user._id,
            email: email || user.email,
            phone: phone || user.phone,
            message,
        });

        await newTicket.save();

        res.status(201).json({ message: "Ticket Created successfully" });

    } catch (error) {
        console.error('Error creating Ticket:', error);
        next(error);
    }
};