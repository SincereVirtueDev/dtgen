import { create } from 'zustand'
import axios from 'axios'

const API_URL = 'http://localhost:8000/api'

export interface Person {
  id: number
  family_tree_id: number
  full_name: string
  other_names?: string
  gender: 'M' | 'F'
  status: 'ALIVE' | 'DECEASED' | 'UNKNOWN'
  solar_birth_date?: string
  lunar_birth_date?: string
  birth_year?: number
  solar_death_date?: string
  lunar_death_date?: string
  death_year?: number
  job?: string
  origin_place?: string
  birth_place?: string
  death_place?: string
  burial_place?: string
  avatar_url?: string
  bio?: string
  notes?: string
  generation: number
  birth_order?: number
  father_id?: number
  mother_id?: number
}

export interface Marriage {
  id: number
  family_tree_id: number
  husband_id: number
  wife_id: number
  rank: 'VỢ CẢ' | 'VỢ THỨ' | 'VỢ KẾ' | 'CHỒNG' | 'KHÔNG RÕ'
  start_date?: string
  end_date?: string
  notes?: string
}

export interface FamilyTree {
  id: number
  name: string
  description?: string
  created_at: string
}

export interface Event {
  id: number
  family_tree_id: number
  title: string
  event_type: 'GIỖ' | 'LỄ TẾT' | 'HỌP HỌ' | 'KHÁC'
  lunar_day?: number
  lunar_month?: number
  is_recurring: boolean
  related_person_id?: number
  description?: string
}

interface GenealogyState {
  familyTrees: FamilyTree[]
  events: Event[]
  persons: Person[]
  marriages: Marriage[]
  loading: boolean
  error: string | null
  focusedPersonId: number | null
  displayGenerations: number
  maxGenerations: number
  treeMode: 'full' | 'traditional' | 'male_only'
  currentFamilyTreeId: number | null
  fetchData: () => Promise<void>
  setFocusedPerson: (id: number | null) => void
  setDisplayGenerations: (gens: number) => void
  setTreeMode: (mode: 'full' | 'traditional' | 'male_only') => void
  setCurrentFamilyTreeId: (id: number | null) => void
  deletePerson: (id: number) => Promise<void>
  updatePerson: (id: number, data: Partial<Person>) => Promise<void>
  createPerson: (data: Partial<Person>) => Promise<void>
  addSpouse: (personId: number, spouseData: Partial<Person>) => Promise<void>
  updateMarriage: (id: number, data: Partial<Marriage>) => Promise<void>
  updateFamilyTree: (id: number, data: Partial<FamilyTree>) => Promise<void>
}

export const useGenealogyStore = create<GenealogyState>((set, get) => ({
  familyTrees: [],
  events: [],
  persons: [],
  marriages: [],
  loading: false,
  error: null,
  focusedPersonId: null,
  displayGenerations: 3,
  maxGenerations: 10,
  treeMode: 'traditional',
  currentFamilyTreeId: null,

  fetchData: async () => {
    set({ loading: true, error: null })
    try {
      const [treesRes, personsRes, marriagesRes, eventsRes] = await Promise.all([
        axios.get<FamilyTree[]>(`${API_URL}/family_trees`),
        axios.get<Person[]>(`${API_URL}/persons`),
        axios.get<Marriage[]>(`${API_URL}/marriages`),
        axios.get<Event[]>(`${API_URL}/events`)
      ])
      
      const persons = personsRes.data;
      const maxGens = persons.length > 0 
        ? Math.max(...persons.map(p => p.generation || 1)) 
        : 10;
        
      set({ 
        familyTrees: treesRes.data,
        persons: persons, 
        marriages: marriagesRes.data,
        events: eventsRes.data,
        maxGenerations: maxGens,
        // Optional: keep current displayGenerations if it's valid, otherwise set to max
        displayGenerations: get().displayGenerations > maxGens ? maxGens : get().displayGenerations,
        currentFamilyTreeId: treesRes.data.length > 0 ? treesRes.data[0].id : null,
        loading: false 
      })
    } catch (err: any) {
      set({ error: err.message, loading: false })
    }
  },

  setFocusedPerson: (id) => set({ focusedPersonId: id }),
  setDisplayGenerations: (gens) => set({ displayGenerations: gens }),
  setTreeMode: (mode) => set({ treeMode: mode }),
  setCurrentFamilyTreeId: (id) => set({ currentFamilyTreeId: id }),

  deletePerson: async (id: number) => {
    set({ loading: true, error: null });
    try {
      await axios.delete(`${API_URL}/persons/${id}`);
      set({ 
        persons: get().persons.filter(p => p.id !== id),
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
    }
  },

  updateFamilyTree: async (id: number, data: Partial<FamilyTree>) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`${API_URL}/family_trees/${id}`, data);
      get().fetchData();
    } catch (error) {
      set({ error: 'Failed to update family tree', loading: false });
      throw error;
    }
  },

  updatePerson: async (id: number, data: Partial<Person>) => {
    set({ loading: true, error: null });
    try {
      // API_URL = 'http://localhost:8000/api'
      const res = await axios.put<Person>(`${API_URL}/persons/${id}`, data);
      set({
        persons: get().persons.map(p => p.id === id ? res.data : p),
        loading: false
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err; // throw so the component can show a toast or handle error
    }
  },

  createPerson: async (data: Partial<Person>) => {
    set({ loading: true, error: null });
    try {
      // POST API doesn't exist? Wait, it does: @app.post("/api/persons")
      const res = await axios.post<Person>(`${API_URL}/persons`, data);
      
      // We must refetch data to get the newly created spouses/marriages as well!
      // This is important because the backend might create an unknown spouse automatically.
      const [treesRes, personsRes, marriagesRes, eventsRes] = await Promise.all([
        axios.get<FamilyTree[]>(`${API_URL}/family_trees`),
        axios.get<Person[]>(`${API_URL}/persons`),
        axios.get<Marriage[]>(`${API_URL}/marriages`),
        axios.get<Event[]>(`${API_URL}/events`)
      ]);
      
      const persons = personsRes.data;
      const maxGens = persons.length > 0 
        ? Math.max(...persons.map(p => p.generation || 1)) 
        : 10;
        
      set({ 
        familyTrees: treesRes.data,
        persons: persons, 
        marriages: marriagesRes.data,
        events: eventsRes.data,
        maxGenerations: maxGens,
        loading: false 
      });
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  addSpouse: async (personId: number, spouseData: Partial<Person>) => {
    set({ loading: true, error: null });
    try {
      await axios.post(`${API_URL}/persons/${personId}/spouse`, spouseData);
      get().fetchData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  },

  updateMarriage: async (id: number, data: Partial<Marriage>) => {
    set({ loading: true, error: null });
    try {
      await axios.put(`${API_URL}/marriages/${id}`, data);
      get().fetchData();
    } catch (err: any) {
      set({ error: err.message, loading: false });
      throw err;
    }
  }
}))
