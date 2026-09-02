const crypto = require('crypto');
const supabase = require('../config/supabaseClient');

// ---------- GET /salons/:id/services ----------
async function getServicesBySalon(req, res) {
  try {
    const { id } = req.params; // salon id

    // Confirm the salon exists first for a clearer 404
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (salonError) return res.status(500).json({ error: 'Database error.', details: salonError.message });
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('salonId', id);

    if (error) return res.status(500).json({ error: 'Failed to fetch services.', details: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- GET /services/available ----------
// NOTE: must be registered BEFORE /services/:id in the router.
async function getAvailableServices(req, res) {
  try {
    const { data, error } = await supabase
      .from('services')
      .select('*')
      .eq('isAvailable', true);

    if (error) return res.status(500).json({ error: 'Failed to fetch available services.', details: error.message });
    return res.status(200).json(data);
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- POST /salons/:id/services (JWT required) ----------
async function createService(req, res) {
  try {
    const { id } = req.params; // salon id
    const { serviceName, price, duration, isAvailable } = req.body;

    if (!serviceName || price === undefined || !duration) {
      return res.status(400).json({ error: 'serviceName, price, and duration are required.' });
    }
    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({ error: 'price must be a positive number.' });
    }

    // Confirm salon exists
    const { data: salon, error: salonError } = await supabase
      .from('salons')
      .select('id')
      .eq('id', id)
      .maybeSingle();

    if (salonError) return res.status(500).json({ error: 'Database error.', details: salonError.message });
    if (!salon) return res.status(404).json({ error: 'Salon not found.' });

    const newService = {
      id: crypto.randomUUID(),
      salonId: id,
      serviceName,
      price,
      duration,
      isAvailable: isAvailable !== undefined ? isAvailable : true
    };

    const { data, error } = await supabase.from('services').insert([newService]).select().single();
    if (error) return res.status(500).json({ error: 'Failed to create service.', details: error.message });

    return res.status(201).json({ message: 'Service created successfully.', service: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- PUT /services/:id (JWT required) ----------
async function updateService(req, res) {
  try {
    const { id } = req.params;
    const { serviceName, price, duration, isAvailable } = req.body;

    if (price !== undefined && (typeof price !== 'number' || price < 0)) {
      return res.status(400).json({ error: 'price must be a positive number.' });
    }

    const updates = {};
    if (serviceName !== undefined) updates.serviceName = serviceName;
    if (price !== undefined) updates.price = price;
    if (duration !== undefined) updates.duration = duration;
    if (isAvailable !== undefined) updates.isAvailable = isAvailable;

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'No valid fields provided to update.' });
    }

    const { data, error } = await supabase
      .from('services')
      .update(updates)
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to update service.', details: error.message });
    if (!data) return res.status(404).json({ error: 'Service not found.' });

    return res.status(200).json({ message: 'Service updated successfully.', service: data });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

// ---------- DELETE /services/:id (JWT required) ----------
async function deleteService(req, res) {
  try {
    const { id } = req.params;

    const { data, error } = await supabase
      .from('services')
      .delete()
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) return res.status(500).json({ error: 'Failed to delete service.', details: error.message });
    if (!data) return res.status(404).json({ error: 'Service not found.' });

    return res.status(200).json({ message: 'Service deleted successfully.' });
  } catch (err) {
    return res.status(500).json({ error: 'Server error.', details: err.message });
  }
}

module.exports = {
  getServicesBySalon,
  getAvailableServices,
  createService,
  updateService,
  deleteService
};
