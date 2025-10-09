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


// ✅ get all Ticket
export const getAllTicket = async (req, res, next) => {
    try {

        const tickets = await Ticket.find()
            .populate("userId", "name email phone")
            .sort({ createdAt: -1 });

        if (!tickets.length) {
            return res.status(404).json({ message: "No tickets found" });
        }

        res.status(200).json({
            success: true,
            total: tickets.length,
            data: tickets,
        });

    } catch (error) {
        console.error("Error fetching Tickets:", error);
        next(error);
    }
};
