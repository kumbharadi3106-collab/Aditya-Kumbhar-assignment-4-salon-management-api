const crypto = require('crypto');
const supabase = require('../config/supabaseClient');

// ---------- GET /salons ----------
async function getAllSalons(req, res) {
  try {
    const { data, error } = await supabase.from('salons').select('*');
    if (error) return res.status(500).json({ error: 'Failed to fetch salons.', details: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- GET /salons/top ----------
// NOTE: this route must be registered BEFORE /salons/:id in the router,
// otherwise "top" would be interpreted as an :id value.
async function getTopSalons(req, res) {
  try {
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .order('rating', { ascending: false })
      .limit(5);

    if (error) return res.status(500).json({ error: 'Failed to fetch top salons.', details: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- GET /salons/city/:city ----------
async function getSalonsByCity(req, res) {
  try {
    const { city } = req.params;
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .ilike('city', city); // case-insensitive match

    if (error) return res.status(500).json({ error: 'Failed to fetch salons by city.', details: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- GET /salons/:id ----------
async function getSalonById(req, res) {
  try {
    const { id } = req.params;
    const { data, error } = await supabase
      .from('salons')
      .select('*')
      .eq('id', id)
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to fetch salon.', details: error.message });
    if (!data) return res.status(404).json({ error: 'Salon not found.' });

    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- POST /salons (JWT required) ----------
async function createSalon(req, res) {
  try {
    const { name, city, address, rating } = req.body;

    if (!name || !city || !address) {
      return res.status(400).json({ error: 'name, city, and address are required.' });
    }
    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'rating must be a number between 0 and 5.' });
    }

    const newSalon = {
      id: crypto.randomUUID(),
      name,
      city,
      address,
      rating: rating ?? 0
    };

    const { data, error } = await supabase.from('salons').insert([newSalon]).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create salon.', details: error.message });

    return res.status(201).json({ message: 'Salon created successfully.', salon: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- PUT /salons/:id (JWT required) ----------
async function updateSalon(req, res) {
  try {
    const { id } = req.params;
    const { name, city, address, rating } = req.body;

    if (rating !== undefined && (typeof rating !== 'number' || rating < 0 || rating > 5)) {
      return res.status(400).json({ error: 'rating must be a number between 0 and 5.' });
    }

    const updates = {};
    if (name !== undefined) updates.name = name;
    if (city !== undefined) updates.city = city;
    if (address !== undefined) updates.address = address;
    if (rating !== undefined) updates.rating = rating;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update.' });
    }

    const { data, error } = await supabase
      .from('salons')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to update salon.', details: error.message });
    if (!data) return res.status(404).json({ error: 'Salon not found.' });

    return res.status(200).json({ message: 'Salon updated successfully.', salon: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- DELETE /salons/:id (JWT required) ----------
async function deleteSalon(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('salons')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to delete salon.', details: error.message });
    if (!data) return res.status(404).json({ error: 'Salon not found.' });

    return res.status(200).json({ message: 'Salon deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

module.exports = {
  getAllSalons,
  getTopSalons,
  getSalonsByCity,
  getSalonById,
  createSalon,
  updateSalon,
  deleteSalon
};
