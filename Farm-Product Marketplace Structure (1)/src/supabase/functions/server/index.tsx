import { Hono } from "npm:hono";
import { cors } from "npm:hono/cors";
import { logger } from "npm:hono/logger";
import * as kv from "./kv_store.tsx";
import { createClient } from "jsr:@supabase/supabase-js@2";

const app = new Hono();

// Enable logger
app.use('*', logger(console.log));

// Enable CORS for all routes and methods
app.use(
  "/*",
  cors({
    origin: "*",
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    exposeHeaders: ["Content-Length"],
    maxAge: 600,
  }),
);

// Create Supabase client for auth
const getSupabaseClient = () => {
  return createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );
};

// Helper to verify user from access token
async function verifyUser(authHeader: string | null) {
  if (!authHeader) return null;
  const token = authHeader.split(' ')[1];
  if (!token) return null;
  
  const supabase = getSupabaseClient();
  const { data: { user }, error } = await supabase.auth.getUser(token);
  if (error || !user) return null;
  return user;
}

// Health check endpoint
app.get("/make-server-fde7e51a/health", (c) => {
  return c.json({ status: "ok" });
});

// ==================== AUTH ROUTES ====================

// Sign up (creates user with email confirmation bypassed)
app.post("/make-server-fde7e51a/auth/signup", async (c) => {
  try {
    const body = await c.req.json();
    const { email, password, name, role, phone, location } = body;

    if (!email || !password || !role) {
      return c.json({ error: "Email, password, and role are required" }, 400);
    }

    const supabase = getSupabaseClient();
    const { data, error } = await supabase.auth.admin.createUser({
      email,
      password,
      user_metadata: { name, role, phone, location },
      // Auto-confirm email since we don't have email server configured
      email_confirm: true
    });

    if (error) {
      console.log("Signup error:", error);
      return c.json({ error: error.message }, 400);
    }

    // Store user profile in KV
    await kv.set(`user:${data.user.id}`, {
      id: data.user.id,
      email,
      name,
      role,
      phone,
      location,
      verified: false,
      rating: 0,
      createdAt: new Date().toISOString()
    });

    return c.json({ user: data.user });
  } catch (error) {
    console.log("Signup error:", error);
    return c.json({ error: "Signup failed" }, 500);
  }
});

// ==================== LISTINGS ROUTES ====================

// Get all listings (with filters)
app.get("/make-server-fde7e51a/listings", async (c) => {
  try {
    const crop = c.req.query("crop");
    const mandi = c.req.query("mandi");
    const grade = c.req.query("grade");
    const status = c.req.query("status") || "published";

    // Get all listings from KV
    const listings = await kv.getByPrefix("listing:");
    
    let filteredListings = listings.filter((l: any) => 
      l.status === status || status === "all"
    );

    if (crop && crop !== "all") {
      filteredListings = filteredListings.filter((l: any) => l.crop === crop);
    }
    if (mandi && mandi !== "all") {
      filteredListings = filteredListings.filter((l: any) => l.mandi.includes(mandi));
    }
    if (grade && grade !== "all") {
      filteredListings = filteredListings.filter((l: any) => l.grade === grade);
    }

    return c.json({ listings: filteredListings });
  } catch (error) {
    console.log("Get listings error:", error);
    return c.json({ error: "Failed to fetch listings" }, 500);
  }
});

// Get single listing
app.get("/make-server-fde7e51a/listings/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const listing = await kv.get(`listing:${id}`);
    
    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    return c.json({ listing });
  } catch (error) {
    console.log("Get listing error:", error);
    return c.json({ error: "Failed to fetch listing" }, 500);
  }
});

// Create listing (requires auth)
app.post("/make-server-fde7e51a/listings", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { crop, grade, quantity, unit, pricePerUnit, mandi, packaging, harvestDate, description, images, certification } = body;

    if (!crop || !quantity || !pricePerUnit || !mandi) {
      return c.json({ error: "Required fields missing" }, 400);
    }

    const listingId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    // Get user profile
    const userProfile = await kv.get(`user:${user.id}`);

    const listing = {
      id: listingId,
      supplierId: user.id,
      supplierName: userProfile?.name || user.email,
      supplierRating: userProfile?.rating || 0,
      supplierVerified: userProfile?.verified || false,
      supplierLocation: userProfile?.location || "",
      crop,
      grade: grade || "Standard",
      quantity: parseInt(quantity),
      unit: unit || "kg",
      pricePerUnit: parseFloat(pricePerUnit),
      mandi,
      packaging: packaging || "",
      harvestDate: harvestDate || new Date().toISOString(),
      images: images || [],
      certification: certification || "",
      description: description || "",
      status: "published",
      createdAt: new Date().toISOString()
    };

    await kv.set(`listing:${listingId}`, listing);

    return c.json({ listing });
  } catch (error) {
    console.log("Create listing error:", error);
    return c.json({ error: "Failed to create listing" }, 500);
  }
});

// Update listing (requires auth)
app.put("/make-server-fde7e51a/listings/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const listing = await kv.get(`listing:${id}`);
    
    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    if (listing.supplierId !== user.id) {
      return c.json({ error: "Forbidden - not your listing" }, 403);
    }

    const body = await c.req.json();
    const updatedListing = { ...listing, ...body };

    await kv.set(`listing:${id}`, updatedListing);

    return c.json({ listing: updatedListing });
  } catch (error) {
    console.log("Update listing error:", error);
    return c.json({ error: "Failed to update listing" }, 500);
  }
});

// Delete listing (requires auth)
app.delete("/make-server-fde7e51a/listings/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const listing = await kv.get(`listing:${id}`);
    
    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    if (listing.supplierId !== user.id) {
      return c.json({ error: "Forbidden - not your listing" }, 403);
    }

    await kv.del(`listing:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log("Delete listing error:", error);
    return c.json({ error: "Failed to delete listing" }, 500);
  }
});

// Get supplier's listings
app.get("/make-server-fde7e51a/suppliers/:id/listings", async (c) => {
  try {
    const supplierId = c.req.param("id");
    const listings = await kv.getByPrefix("listing:");
    
    const supplierListings = listings.filter((l: any) => l.supplierId === supplierId);

    return c.json({ listings: supplierListings });
  } catch (error) {
    console.log("Get supplier listings error:", error);
    return c.json({ error: "Failed to fetch listings" }, 500);
  }
});

// ==================== ORDERS ROUTES ====================

// Get all orders for a user
app.get("/make-server-fde7e51a/orders", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const orders = await kv.getByPrefix("order:");
    
    // Filter orders where user is buyer or supplier
    const userOrders = orders.filter((o: any) => 
      o.buyerId === user.id || o.supplierId === user.id
    );

    return c.json({ orders: userOrders });
  } catch (error) {
    console.log("Get orders error:", error);
    return c.json({ error: "Failed to fetch orders" }, 500);
  }
});

// Create order/inquiry
app.post("/make-server-fde7e51a/orders", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { listingId, quantity, message } = body;

    if (!listingId || !quantity) {
      return c.json({ error: "Listing ID and quantity required" }, 400);
    }

    const listing = await kv.get(`listing:${listingId}`);
    if (!listing) {
      return c.json({ error: "Listing not found" }, 404);
    }

    const userProfile = await kv.get(`user:${user.id}`);
    const orderId = `ord-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const order = {
      id: orderId,
      listingId,
      buyerId: user.id,
      buyerName: userProfile?.name || user.email,
      supplierId: listing.supplierId,
      crop: listing.crop,
      quantity: parseInt(quantity),
      unit: listing.unit,
      unitPrice: listing.pricePerUnit,
      totalAmount: listing.pricePerUnit * parseInt(quantity),
      status: "inquiry",
      message: message || "",
      createdAt: new Date().toISOString()
    };

    await kv.set(`order:${orderId}`, order);

    return c.json({ order });
  } catch (error) {
    console.log("Create order error:", error);
    return c.json({ error: "Failed to create order" }, 500);
  }
});

// Update order status
app.patch("/make-server-fde7e51a/orders/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const order = await kv.get(`order:${id}`);
    
    if (!order) {
      return c.json({ error: "Order not found" }, 404);
    }

    // Only buyer or supplier can update
    if (order.buyerId !== user.id && order.supplierId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const body = await c.req.json();
    const updatedOrder = { ...order, ...body };

    await kv.set(`order:${id}`, updatedOrder);

    return c.json({ order: updatedOrder });
  } catch (error) {
    console.log("Update order error:", error);
    return c.json({ error: "Failed to update order" }, 500);
  }
});

// ==================== MANDI RATES ROUTES ====================

// Get mandi rates (with filters)
app.get("/make-server-fde7e51a/mandi-rates", async (c) => {
  try {
    const crop = c.req.query("crop");
    const mandi = c.req.query("mandi");
    const date = c.req.query("date");

    const rates = await kv.getByPrefix("mandi-rate:");
    
    let filteredRates = rates;

    if (crop) {
      filteredRates = filteredRates.filter((r: any) => 
        r.crop.toLowerCase().includes(crop.toLowerCase())
      );
    }
    if (mandi) {
      filteredRates = filteredRates.filter((r: any) => 
        r.mandi.toLowerCase().includes(mandi.toLowerCase())
      );
    }
    if (date) {
      filteredRates = filteredRates.filter((r: any) => r.date === date);
    }

    return c.json({ rates: filteredRates });
  } catch (error) {
    console.log("Get mandi rates error:", error);
    return c.json({ error: "Failed to fetch rates" }, 500);
  }
});

// Admin: Seed initial mandi rates (for demo)
app.post("/make-server-fde7e51a/admin/seed-mandi-rates", async (c) => {
  try {
    const seedRates = [
      {
        id: '1',
        crop: 'Wheat',
        mandi: 'Azadpur Mandi',
        state: 'Delhi',
        govtRate: 2125,
        date: '2025-10-19',
        change: 2.5,
      },
      {
        id: '2',
        crop: 'Rice',
        mandi: 'Karnal Mandi',
        state: 'Haryana',
        govtRate: 2850,
        date: '2025-10-19',
        change: -1.2,
      },
      {
        id: '3',
        crop: 'Tomato',
        mandi: 'Koyambedu Market',
        state: 'Tamil Nadu',
        govtRate: 18,
        date: '2025-10-19',
        change: 15.5,
      },
      {
        id: '4',
        crop: 'Onion',
        mandi: 'Lasalgaon Mandi',
        state: 'Maharashtra',
        govtRate: 22,
        date: '2025-10-19',
        change: -8.3,
      },
      {
        id: '5',
        crop: 'Potato',
        mandi: 'Agra Mandi',
        state: 'Uttar Pradesh',
        govtRate: 12,
        date: '2025-10-19',
        change: 0,
      },
    ];

    for (const rate of seedRates) {
      await kv.set(`mandi-rate:${rate.id}`, rate);
    }

    return c.json({ success: true, count: seedRates.length });
  } catch (error) {
    console.log("Seed rates error:", error);
    return c.json({ error: "Failed to seed rates" }, 500);
  }
});

// ==================== USER ROUTES ====================

// Get user profile
app.get("/make-server-fde7e51a/users/me", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    
    return c.json({ user: profile || { id: user.id, email: user.email } });
  } catch (error) {
    console.log("Get user error:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// Update user profile
app.put("/make-server-fde7e51a/users/me", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const currentProfile = await kv.get(`user:${user.id}`) || { id: user.id, email: user.email };
    
    const updatedProfile = { ...currentProfile, ...body };

    await kv.set(`user:${user.id}`, updatedProfile);

    return c.json({ user: updatedProfile });
  } catch (error) {
    console.log("Update user error:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Get public user profile
app.get("/make-server-fde7e51a/users/:id", async (c) => {
  try {
    const id = c.req.param("id");
    const profile = await kv.get(`user:${id}`);
    
    if (!profile) {
      return c.json({ error: "User not found" }, 404);
    }
    
    // Return public data only
    const publicProfile = {
      id: profile.id,
      name: profile.name,
      role: profile.role,
      location: profile.location,
      verified: profile.verified,
      rating: profile.rating,
      createdAt: profile.createdAt
    };

    return c.json({ user: publicProfile });
  } catch (error) {
    console.log("Get user error:", error);
    return c.json({ error: "Failed to fetch user" }, 500);
  }
});

// ==================== CHAT/MESSAGES ROUTES ====================

// Get messages for a conversation
app.get("/make-server-fde7e51a/messages", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const conversationId = c.req.query("conversationId");
    
    if (conversationId) {
      const messages = await kv.getByPrefix(`message:${conversationId}:`);
      return c.json({ messages: messages.sort((a: any, b: any) => 
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
      )});
    }

    // Get all conversations for user
    const allMessages = await kv.getByPrefix("message:");
    const userMessages = allMessages.filter((m: any) => 
      m.senderId === user.id || m.receiverId === user.id
    );

    // Group by conversation
    const conversations = new Map();
    userMessages.forEach((msg: any) => {
      const convId = msg.conversationId;
      if (!conversations.has(convId)) {
        conversations.set(convId, []);
      }
      conversations.get(convId).push(msg);
    });

    const conversationList = Array.from(conversations.entries()).map(([id, msgs]: [string, any]) => {
      const sorted = msgs.sort((a: any, b: any) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      return {
        conversationId: id,
        lastMessage: sorted[0],
        unreadCount: sorted.filter((m: any) => !m.read && m.receiverId === user.id).length,
        messages: sorted
      };
    });

    return c.json({ conversations: conversationList });
  } catch (error) {
    console.log("Get messages error:", error);
    return c.json({ error: "Failed to fetch messages" }, 500);
  }
});

// Send message
app.post("/make-server-fde7e51a/messages", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { receiverId, content, conversationId, orderId, offerPrice } = body;

    if (!receiverId || !content) {
      return c.json({ error: "Receiver and content required" }, 400);
    }

    const convId = conversationId || `conv-${[user.id, receiverId].sort().join('-')}`;
    const messageId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    const message = {
      id: messageId,
      conversationId: convId,
      senderId: user.id,
      receiverId,
      content,
      orderId: orderId || null,
      offerPrice: offerPrice || null,
      read: false,
      createdAt: new Date().toISOString()
    };

    await kv.set(`message:${convId}:${messageId}`, message);

    // Create notification
    const notifId = `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    await kv.set(`notification:${receiverId}:${notifId}`, {
      id: notifId,
      userId: receiverId,
      type: 'message',
      title: 'New Message',
      message: `You have a new message`,
      read: false,
      createdAt: new Date().toISOString()
    });

    return c.json({ message });
  } catch (error) {
    console.log("Send message error:", error);
    return c.json({ error: "Failed to send message" }, 500);
  }
});

// Mark messages as read
app.patch("/make-server-fde7e51a/messages/:id/read", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const messages = await kv.getByPrefix(`message:`);
    const message = messages.find((m: any) => m.id === id);
    
    if (!message) {
      return c.json({ error: "Message not found" }, 404);
    }

    if (message.receiverId !== user.id) {
      return c.json({ error: "Forbidden" }, 403);
    }

    const updatedMessage = { ...message, read: true };
    await kv.set(`message:${message.conversationId}:${id}`, updatedMessage);

    return c.json({ message: updatedMessage });
  } catch (error) {
    console.log("Mark read error:", error);
    return c.json({ error: "Failed to mark as read" }, 500);
  }
});

// ==================== REVIEWS ROUTES ====================

// Get reviews for a user
app.get("/make-server-fde7e51a/reviews/:userId", async (c) => {
  try {
    const userId = c.req.param("userId");
    const reviews = await kv.getByPrefix(`review:${userId}:`);
    
    return c.json({ reviews });
  } catch (error) {
    console.log("Get reviews error:", error);
    return c.json({ error: "Failed to fetch reviews" }, 500);
  }
});

// Create review
app.post("/make-server-fde7e51a/reviews", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { orderId, revieweeId, rating, comment } = body;

    if (!orderId || !revieweeId || !rating) {
      return c.json({ error: "Order ID, reviewee, and rating required" }, 400);
    }

    const reviewId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userProfile = await kv.get(`user:${user.id}`);

    const review = {
      id: reviewId,
      orderId,
      reviewerId: user.id,
      reviewerName: userProfile?.name || user.email,
      revieweeId,
      rating: parseInt(rating),
      comment: comment || "",
      createdAt: new Date().toISOString()
    };

    await kv.set(`review:${revieweeId}:${reviewId}`, review);

    // Update user rating
    const revieweeProfile = await kv.get(`user:${revieweeId}`);
    if (revieweeProfile) {
      const allReviews = await kv.getByPrefix(`review:${revieweeId}:`);
      const avgRating = allReviews.reduce((sum: number, r: any) => sum + r.rating, 0) / allReviews.length;
      await kv.set(`user:${revieweeId}`, { ...revieweeProfile, rating: avgRating });
    }

    return c.json({ review });
  } catch (error) {
    console.log("Create review error:", error);
    return c.json({ error: "Failed to create review" }, 500);
  }
});

// ==================== WATCHLIST ROUTES ====================

// Get user's watchlist
app.get("/make-server-fde7e51a/watchlist", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const items = await kv.getByPrefix(`watchlist:${user.id}:`);
    
    return c.json({ items });
  } catch (error) {
    console.log("Get watchlist error:", error);
    return c.json({ error: "Failed to fetch watchlist" }, 500);
  }
});

// Add to watchlist
app.post("/make-server-fde7e51a/watchlist", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { type, itemId, crop, mandi, targetPrice } = body;

    const watchId = `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const item = {
      id: watchId,
      userId: user.id,
      type, // 'listing', 'supplier', 'crop'
      itemId,
      crop,
      mandi,
      targetPrice,
      createdAt: new Date().toISOString()
    };

    await kv.set(`watchlist:${user.id}:${watchId}`, item);

    return c.json({ item });
  } catch (error) {
    console.log("Add to watchlist error:", error);
    return c.json({ error: "Failed to add to watchlist" }, 500);
  }
});

// Remove from watchlist
app.delete("/make-server-fde7e51a/watchlist/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    await kv.del(`watchlist:${user.id}:${id}`);

    return c.json({ success: true });
  } catch (error) {
    console.log("Remove from watchlist error:", error);
    return c.json({ error: "Failed to remove from watchlist" }, 500);
  }
});

// ==================== NOTIFICATIONS ROUTES ====================

// Get user notifications
app.get("/make-server-fde7e51a/notifications", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    
    const sorted = notifications.sort((a: any, b: any) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );

    return c.json({ notifications: sorted });
  } catch (error) {
    console.log("Get notifications error:", error);
    return c.json({ error: "Failed to fetch notifications" }, 500);
  }
});

// Mark notification as read
app.patch("/make-server-fde7e51a/notifications/:id/read", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const id = c.req.param("id");
    const notifications = await kv.getByPrefix(`notification:${user.id}:`);
    const notification = notifications.find((n: any) => n.id === id);
    
    if (!notification) {
      return c.json({ error: "Notification not found" }, 404);
    }

    const updated = { ...notification, read: true };
    await kv.set(`notification:${user.id}:${id}`, updated);

    return c.json({ notification: updated });
  } catch (error) {
    console.log("Mark notification read error:", error);
    return c.json({ error: "Failed to mark as read" }, 500);
  }
});

// ==================== ADMIN ROUTES ====================

// Get all users (admin only)
app.get("/make-server-fde7e51a/admin/users", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: "Forbidden - admin only" }, 403);
    }

    const users = await kv.getByPrefix("user:");
    
    return c.json({ users });
  } catch (error) {
    console.log("Get all users error:", error);
    return c.json({ error: "Failed to fetch users" }, 500);
  }
});

// Update user status (admin only)
app.patch("/make-server-fde7e51a/admin/users/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: "Forbidden - admin only" }, 403);
    }

    const id = c.req.param("id");
    const targetUser = await kv.get(`user:${id}`);
    
    if (!targetUser) {
      return c.json({ error: "User not found" }, 404);
    }

    const body = await c.req.json();
    const updated = { ...targetUser, ...body };

    await kv.set(`user:${id}`, updated);

    return c.json({ user: updated });
  } catch (error) {
    console.log("Update user status error:", error);
    return c.json({ error: "Failed to update user" }, 500);
  }
});

// Get all listings for moderation (admin only)
app.get("/make-server-fde7e51a/admin/listings", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: "Forbidden - admin only" }, 403);
    }

    const listings = await kv.getByPrefix("listing:");
    
    return c.json({ listings });
  } catch (error) {
    console.log("Get all listings error:", error);
    return c.json({ error: "Failed to fetch listings" }, 500);
  }
});

// Get analytics data (admin only)
app.get("/make-server-fde7e51a/admin/analytics", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: "Forbidden - admin only" }, 403);
    }

    const users = await kv.getByPrefix("user:");
    const listings = await kv.getByPrefix("listing:");
    const orders = await kv.getByPrefix("order:");
    const messages = await kv.getByPrefix("message:");

    const analytics = {
      totalUsers: users.length,
      totalSuppliers: users.filter((u: any) => u.role === 'supplier').length,
      totalBuyers: users.filter((u: any) => u.role === 'buyer').length,
      totalListings: listings.length,
      activeListings: listings.filter((l: any) => l.status === 'published').length,
      totalOrders: orders.length,
      totalRevenue: orders.reduce((sum: number, o: any) => sum + (o.totalAmount || 0), 0),
      totalMessages: messages.length,
      recentOrders: orders.slice(-10).reverse()
    };

    return c.json({ analytics });
  } catch (error) {
    console.log("Get analytics error:", error);
    return c.json({ error: "Failed to fetch analytics" }, 500);
  }
});

// ==================== DISPUTES ROUTES ====================

// Create dispute
app.post("/make-server-fde7e51a/disputes", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const body = await c.req.json();
    const { orderId, reason, description } = body;

    if (!orderId || !reason) {
      return c.json({ error: "Order ID and reason required" }, 400);
    }

    const disputeId = `dispute-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const userProfile = await kv.get(`user:${user.id}`);

    const dispute = {
      id: disputeId,
      orderId,
      raisedBy: user.id,
      raisedByName: userProfile?.name || user.email,
      reason,
      description: description || "",
      status: "open",
      createdAt: new Date().toISOString()
    };

    await kv.set(`dispute:${disputeId}`, dispute);

    return c.json({ dispute });
  } catch (error) {
    console.log("Create dispute error:", error);
    return c.json({ error: "Failed to create dispute" }, 500);
  }
});

// Get disputes (user or admin)
app.get("/make-server-fde7e51a/disputes", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    const disputes = await kv.getByPrefix("dispute:");
    
    // Admin sees all, users see their own
    const filtered = profile?.role === 'admin' 
      ? disputes 
      : disputes.filter((d: any) => d.raisedBy === user.id);

    return c.json({ disputes: filtered });
  } catch (error) {
    console.log("Get disputes error:", error);
    return c.json({ error: "Failed to fetch disputes" }, 500);
  }
});

// Update dispute (admin only)
app.patch("/make-server-fde7e51a/disputes/:id", async (c) => {
  try {
    const user = await verifyUser(c.req.header("Authorization"));
    if (!user) {
      return c.json({ error: "Unauthorized" }, 401);
    }

    const profile = await kv.get(`user:${user.id}`);
    if (profile?.role !== 'admin') {
      return c.json({ error: "Forbidden - admin only" }, 403);
    }

    const id = c.req.param("id");
    const dispute = await kv.get(`dispute:${id}`);
    
    if (!dispute) {
      return c.json({ error: "Dispute not found" }, 404);
    }

    const body = await c.req.json();
    const updated = { ...dispute, ...body };

    await kv.set(`dispute:${id}`, updated);

    return c.json({ dispute: updated });
  } catch (error) {
    console.log("Update dispute error:", error);
    return c.json({ error: "Failed to update dispute" }, 500);
  }
});

Deno.serve(app.fetch);