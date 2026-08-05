import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Input, Textarea } from '@/components/inputs';
import { useAppTheme } from '@/hooks/useAppTheme';
import type { Listing, PropertyType } from '@/lib/models';

const PROPERTY_TYPES: readonly PropertyType[] = [
  'EntireProperty',
  'Apartment',
  'House',
  'Duplex',
  'Studio',
  'SingleRoom',
  'SharedRoom',
  'Hostel',
  'StudentHousing',
  'HotelRoom',
  'Other',
];

function displayPropertyType(t: PropertyType): string {
  const map: Record<PropertyType, string> = {
    EntireProperty: 'Entire Property',
    Apartment: 'Apartment',
    House: 'House',
    Duplex: 'Duplex',
    Studio: 'Studio',
    SingleRoom: 'Single Room',
    SharedRoom: 'Shared Room',
    Hostel: 'Hostel',
    StudentHousing: 'Student Housing',
    HotelRoom: 'Hotel Room',
    Other: 'Other',
  };
  return map[t];
}

export type ListingDraft = {
  title: string;
  location: string;
  price: string;
  currency: 'USD' | 'NGN';
  rooms: string;
  bathrooms: string;
  type: PropertyType;
  description: string;
  images: string;
  amenities: string;
  rules: string;
};

export const EMPTY_DRAFT: ListingDraft = {
  title: '',
  location: '',
  price: '',
  currency: 'NGN',
  rooms: '1',
  bathrooms: '1',
  type: 'Apartment',
  description: '',
  images: '',
  amenities: '',
  rules: '',
};

export function listingToDraft(listing: Listing): ListingDraft {
  return {
    title: listing.title,
    location: listing.location,
    price: String(listing.pricePerNight),
    currency: listing.currency,
    rooms: String(listing.rooms || 1),
    bathrooms: String(listing.bathrooms || 1),
    type: listing.type,
    description: listing.description ?? '',
    images: listing.images.join(', '),
    amenities: listing.amenities.join(', '),
    rules: (listing.rules ?? []).join(', '),
  };
}

export type HostListingsFormProps = {
  editing: Listing | null;
  actionError: string | null;
  saving: boolean;
  onCancel: () => void;
  onSubmit: (draft: ListingDraft) => Promise<void>;
};

export function HostListingsForm({
  editing,
  actionError,
  saving,
  onCancel,
  onSubmit,
}: HostListingsFormProps) {
  const { palette } = useAppTheme();
  const initial = editing ? listingToDraft(editing) : EMPTY_DRAFT;

  const [title, setTitle] = useState(initial.title);
  const [location, setLocation] = useState(initial.location);
  const [price, setPrice] = useState(initial.price);
  const [currency, setCurrency] = useState<'USD' | 'NGN'>(initial.currency);
  const [rooms, setRooms] = useState(initial.rooms);
  const [bathrooms, setBathrooms] = useState(initial.bathrooms);
  const [type, setType] = useState<PropertyType>(initial.type);
  const [description, setDescription] = useState(initial.description);
  const [images, setImages] = useState(initial.images);
  const [amenities, setAmenities] = useState(initial.amenities);
  const [rules, setRules] = useState(initial.rules);

  const parsedPrice = Number(price);
  const canCreate =
    title.trim().length > 0 &&
    location.trim().length > 0 &&
    Number.isFinite(parsedPrice) &&
    parsedPrice > 0 &&
    !saving;

  return (
    <View style={[styles.card, { backgroundColor: palette.card, borderColor: palette.border }]}>
      <Text style={[styles.sectionTitle, { color: palette.text }]}>
        {editing ? 'Update listing' : 'Create listing'}
      </Text>

      <Input
        value={title}
        onChangeText={setTitle}
        placeholder="Title"
        leftIcon="textformat"
      />
      <Input
        value={location}
        onChangeText={setLocation}
        placeholder="Location"
        leftIcon="mappin"
      />

      <View style={{ flexDirection: 'row', gap: 10, alignItems: 'flex-end' }}>
        <Input
          containerStyle={{ flex: 1.6 }}
          value={price}
          onChangeText={setPrice}
          placeholder="Price per night"
          keyboardType="numeric"
        />
        <View style={{ flexDirection: 'row', gap: 8, flex: 1, height: 48, alignItems: 'stretch' }}>
          {(['NGN', 'USD'] as const).map((c) => {
            const active = currency === c;
            return (
              <Pressable
                key={c}
                onPress={() => setCurrency(c)}
                style={({ pressed }) => [
                  styles.typeChip,
                  { flex: 1, paddingVertical: 0, justifyContent: 'center', borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
                  active ? { backgroundColor: palette.primarySoft, borderColor: palette.primary } : null,
                ]}>
                <Text style={[styles.typeChipText, { fontSize: 13, color: active ? palette.primary : palette.text }]}>
                  {c === 'USD' ? '$ USD' : '₦ NGN'}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </View>

      <View style={{ flexDirection: 'row', gap: 10 }}>
        <Input
          containerStyle={{ flex: 1 }}
          value={rooms}
          onChangeText={setRooms}
          placeholder="Rooms"
          keyboardType="numeric"
        />
        <Input
          containerStyle={{ flex: 1 }}
          value={bathrooms}
          onChangeText={setBathrooms}
          placeholder="Baths"
          keyboardType="numeric"
        />
      </View>

      <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
        {PROPERTY_TYPES.map((option) => (
          <Pressable
            key={option}
            onPress={() => setType(option)}
            style={({ pressed }) => [
              styles.typeChip,
              { width: '31%', borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
              type === option ? { backgroundColor: palette.primarySoft, borderColor: palette.primary } : null,
            ]}>
            <Text style={[styles.typeChipText, { color: type === option ? palette.primary : palette.text }]}>
              {displayPropertyType(option)}
            </Text>
          </Pressable>
        ))}
      </View>

      <Textarea
        value={description}
        onChangeText={setDescription}
        placeholder="Description (optional)"
        rows={3}
      />
      <Input
        value={images}
        onChangeText={setImages}
        placeholder="Image URLs (comma separated)"
        autoCapitalize="none"
        leftIcon="photo"
      />
      <Input
        value={amenities}
        onChangeText={setAmenities}
        placeholder="Amenities (comma separated)"
        leftIcon="sparkles"
      />
      <Input
        value={rules}
        onChangeText={setRules}
        placeholder="Rules (comma separated)"
        leftIcon="checklist"
      />

      {actionError ? <Text style={{ color: palette.danger }}>{actionError}</Text> : null}

      <Pressable
        disabled={!canCreate}
        onPress={() =>
          onSubmit({
            title,
            location,
            price,
            currency,
            rooms,
            bathrooms,
            type,
            description,
            images,
            amenities,
            rules,
          })
        }
        style={({ pressed }) => [
          styles.primaryButton,
          { backgroundColor: palette.primary },
          !canCreate ? { backgroundColor: palette.primarySoft } : null,
          { opacity: pressed ? 0.9 : 1 },
        ]}>
        <Text style={[styles.primaryButtonText, { color: palette.onPrimary }]}>
          {editing
            ? saving
              ? 'Updating…'
              : 'Update listing'
            : saving
              ? 'Creating…'
              : 'Create listing'}
        </Text>
      </Pressable>

      {editing ? (
        <Pressable
          onPress={onCancel}
          style={({ pressed }) => [
            styles.cancelButton,
            { borderColor: palette.border, opacity: pressed ? 0.9 : 1 },
          ]}>
          <Text style={[styles.cancelButtonText, { color: palette.text }]}>Cancel</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 20,
    borderWidth: 1,
    padding: 16,
    gap: 10,
  },
  sectionTitle: { fontSize: 16, fontWeight: '800' },
  typeChip: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 13,
    alignItems: 'center',
  },
  typeChipText: { fontWeight: '800' },
  primaryButton: {
    marginTop: 6,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: { fontWeight: '800', fontSize: 16 },
  cancelButton: {
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  cancelButtonText: { fontWeight: '800', fontSize: 16 },
});
