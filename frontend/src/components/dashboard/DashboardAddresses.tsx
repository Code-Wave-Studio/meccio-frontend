import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Loader2, MapPin, Pencil, Plus, Star, Trash2 } from 'lucide-react';
import { addressApi } from '@/lib/api';
import { COUNTRIES } from '@/lib/countries';
import { getApiError } from '@/components/AuthLayout';
import type { SavedAddress } from '@/types';
import toast from 'react-hot-toast';

interface AddressForm {
  label: string;
  first_name: string;
  last_name: string;
  company: string;
  address_line1: string;
  address_line2: string;
  city: string;
  state: string;
  postal_code: string;
  country: string;
  phone: string;
  is_default: boolean;
}

const emptyForm: AddressForm = {
  label: 'Home',
  first_name: '',
  last_name: '',
  company: '',
  address_line1: '',
  address_line2: '',
  city: '',
  state: '',
  postal_code: '',
  country: 'US',
  phone: '',
  is_default: false,
};

function countryName(code: string) {
  return COUNTRIES.find((c) => c.code === code)?.name || code;
}

function AddressFormModal({
  initial,
  editingId,
  onClose,
  onSuccess,
}: {
  initial?: Partial<AddressForm>;
  editingId?: number;
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { register, handleSubmit, formState: { errors } } = useForm<AddressForm>({
    defaultValues: { ...emptyForm, ...initial },
  });
  const [loading, setLoading] = useState(false);

  const onSubmit = async (data: AddressForm) => {
    setLoading(true);
    try {
      if (editingId) {
        await addressApi.update(editingId, { ...data });
        toast.success('Address updated');
      } else {
        await addressApi.create({ ...data });
        toast.success('Address saved');
      }
      onSuccess();
      onClose();
    } catch (err) {
      toast.error(getApiError(err, 'Could not save address'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[70] flex items-end sm:items-center justify-center p-0 sm:p-4 bg-charcoal/50 backdrop-blur-sm">
      <div className="bg-white w-full sm:max-w-lg max-h-[92vh] sm:max-h-[90vh] overflow-y-auto border-0 sm:border border-sand/40 shadow-xl rounded-t-2xl sm:rounded-none">
        <div className="sticky top-0 bg-white p-4 sm:p-6 border-b border-sand/40 flex items-center justify-between gap-3">
          <h3 className="font-display text-xl sm:text-2xl">{editingId ? 'Edit Address' : 'Add Address'}</h3>
          <button type="button" onClick={onClose} className="sm:hidden text-stone text-sm uppercase tracking-wider">
            Close
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-4 sm:p-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Label</label>
              <input {...register('label')} className="input-luxury" placeholder="Home, Office..." />
            </div>
            <div className="flex items-end pb-2">
              <label className="flex items-center gap-2 text-sm text-stone cursor-pointer">
                <input type="checkbox" {...register('is_default')} className="accent-charcoal" />
                Set as default
              </label>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">First Name *</label>
              <input {...register('first_name', { required: 'Required' })} className="input-luxury" />
              {errors.first_name && <p className="text-xs text-red-600 mt-1">{errors.first_name.message}</p>}
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Last Name *</label>
              <input {...register('last_name', { required: 'Required' })} className="input-luxury" />
              {errors.last_name && <p className="text-xs text-red-600 mt-1">{errors.last_name.message}</p>}
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Address Line 1 *</label>
            <input {...register('address_line1', { required: 'Required' })} className="input-luxury" />
            {errors.address_line1 && <p className="text-xs text-red-600 mt-1">{errors.address_line1.message}</p>}
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Address Line 2</label>
            <input {...register('address_line2')} className="input-luxury" />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">City *</label>
              <input {...register('city', { required: 'Required' })} className="input-luxury" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">State</label>
              <input {...register('state')} className="input-luxury" />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Postal Code *</label>
              <input {...register('postal_code', { required: 'Required' })} className="input-luxury" />
            </div>
            <div>
              <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Country *</label>
              <select {...register('country', { required: true })} className="input-luxury">
                {COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="block text-[11px] uppercase tracking-[0.14em] text-stone mb-2">Phone</label>
            <input {...register('phone')} type="tel" className="input-luxury" />
          </div>

          <div className="flex flex-col-reverse sm:flex-row gap-3 pt-2 pb-2 sm:pb-0">
            <button type="button" onClick={onClose} className="btn-outline w-full sm:w-auto">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 disabled:opacity-60">
              {loading ? <Loader2 size={18} className="animate-spin mx-auto" /> : 'Save Address'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function DashboardAddresses() {
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<SavedAddress | null>(null);

  const { data: addresses = [], isLoading } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => addressApi.list().then((r) => r.data.data as SavedAddress[]),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => addressApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Address removed');
    },
    onError: (err) => toast.error(getApiError(err, 'Could not delete address')),
  });

  const setDefaultMutation = useMutation({
    mutationFn: (address: SavedAddress) => addressApi.update(address.id, { ...address, is_default: true }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['addresses'] });
      toast.success('Default address updated');
    },
  });

  const refresh = () => queryClient.invalidateQueries({ queryKey: ['addresses'] });

  return (
    <>
      <div className="bg-white border border-sand/40">
        <div className="p-4 sm:p-6 md:p-8 border-b border-sand/40 flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 className="font-display text-xl sm:text-2xl text-charcoal">Saved Addresses</h2>
            <p className="text-xs sm:text-sm text-stone mt-1">Manage shipping addresses for faster checkout</p>
          </div>
          <button type="button" onClick={() => { setEditing(null); setShowForm(true); }} className="btn-primary text-xs">
            <Plus size={16} className="inline mr-1" />
            Add Address
          </button>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 size={28} className="animate-spin text-gold" />
          </div>
        ) : !addresses.length ? (
          <div className="text-center py-12 sm:py-16 px-5">
            <MapPin size={40} className="mx-auto mb-4 text-sand" />
            <p className="font-display text-lg sm:text-xl mb-3">No saved addresses</p>
            <p className="text-stone text-sm mb-6">Add your shipping address for a smoother checkout.</p>
            <button type="button" onClick={() => setShowForm(true)} className="btn-primary">Add Address</button>
          </div>
        ) : (
          <div className="p-4 sm:p-6 md:p-8 grid sm:grid-cols-2 gap-3 sm:gap-4">
            {addresses.map((address) => (
              <div key={address.id} className="border border-sand/40 p-4 sm:p-5 relative">
                {address.is_default ? (
                  <span className="absolute top-3 right-3 sm:top-4 sm:right-4 text-[10px] uppercase tracking-[0.12em] bg-gold/20 text-gold-dark px-2 py-1 flex items-center gap-1">
                    <Star size={10} fill="currentColor" /> Default
                  </span>
                ) : null}

                <p className="text-xs uppercase tracking-[0.14em] text-gold-dark mb-2">{address.label || 'Address'}</p>
                <address className="not-italic text-sm text-charcoal leading-relaxed mb-4">
                  <strong>{address.first_name} {address.last_name}</strong><br />
                  {address.address_line1}<br />
                  {address.address_line2 && <>{address.address_line2}<br /></>}
                  {address.city}{address.state ? `, ${address.state}` : ''} {address.postal_code}<br />
                  {countryName(address.country)}
                  {address.phone && <><br />{address.phone}</>}
                </address>

                <div className="flex flex-wrap gap-2">
                  <button
                    type="button"
                    onClick={() => { setEditing(address); setShowForm(true); }}
                    className="text-xs uppercase tracking-[0.1em] px-3 py-2 border border-sand/50 hover:border-gold transition-colors inline-flex items-center gap-1"
                  >
                    <Pencil size={12} /> Edit
                  </button>
                  {!address.is_default && (
                    <button
                      type="button"
                      onClick={() => setDefaultMutation.mutate(address)}
                      className="text-xs uppercase tracking-[0.1em] px-3 py-2 border border-sand/50 hover:border-gold transition-colors"
                    >
                      Set Default
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => {
                      if (confirm('Delete this address?')) deleteMutation.mutate(address.id);
                    }}
                    className="text-xs uppercase tracking-[0.1em] px-3 py-2 border border-sand/50 hover:border-red-400 hover:text-red-600 transition-colors inline-flex items-center gap-1"
                  >
                    <Trash2 size={12} /> Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {showForm && (
        <AddressFormModal
          editingId={editing?.id}
          initial={editing ? {
            label: editing.label || 'Home',
            first_name: editing.first_name,
            last_name: editing.last_name,
            company: editing.company || '',
            address_line1: editing.address_line1,
            address_line2: editing.address_line2 || '',
            city: editing.city,
            state: editing.state || '',
            postal_code: editing.postal_code,
            country: editing.country,
            phone: editing.phone || '',
            is_default: !!editing.is_default,
          } : undefined}
          onClose={() => { setShowForm(false); setEditing(null); }}
          onSuccess={refresh}
        />
      )}
    </>
  );
}
