import React, { useState, useEffect } from 'react';

import Header from '../../components/Header';

import api from '../../services/api';

import Food from '../../components/Food';
import ModalAddFood from '../../components/ModalAddFood';
import ModalEditFood from '../../components/ModalEditFood';

import { FoodsContainer } from './styles';

interface IFoodPlate {
  id: number;
  name: string;
  image: string;
  price: string;
  description: string;
  available: boolean;
}

const Dashboard: React.FC = () => {
  const [foods, setFoods] = useState<IFoodPlate[]>([]);
  const [editingFood, setEditingFood] = useState<IFoodPlate>({} as IFoodPlate);
  const [modalOpen, setModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  useEffect(() => {
    async function loadFoods(): Promise<void> {
      const response = await api.get('/foods');

      setFoods(response.data);
    }

    loadFoods();
  }, []);

  async function handleAddFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    try {
      const response = await api.post('/foods', { ...food, available: true });
      const newFood = response.data;

      setFoods([...foods, newFood]);
    } catch (err) {
      console.log(err);
    }
  }

  async function handleUpdateFood(
    food: Omit<IFoodPlate, 'id' | 'available'>,
  ): Promise<void> {
    const listFoods = [...foods];
    const foodIndex = foods.findIndex(newFood => newFood.id === editingFood.id);

    const response = await api.put(`/foods/${editingFood.id}`, {
      ...food,
      available: foods[foodIndex].available,
    });

    const updatedFood = response.data;

    listFoods.splice(foodIndex, 1, updatedFood);

    setFoods([...listFoods]);
    setEditingFood({} as IFoodPlate);
  }

  async function handleDeleteFood(id: number): Promise<void> {
    const listFoods = [...foods];
    const foodIndex = foods.findIndex(food => food.id === id);

    listFoods.splice(foodIndex, 1);

    await api.delete(`/foods/${id}`);
    setFoods([...listFoods]);
  }

  function toggleModal(): void {
    setModalOpen(!modalOpen);
  }

  function toggleEditModal(): void {
    setEditModalOpen(!editModalOpen);
  }

  function handleEditFood(food: IFoodPlate): void {
    setEditingFood(food);
    toggleEditModal();
  }

  async function handleEditAvailability(id: number): Promise<void> {
    const listFood = [...foods];
    const foodIndex = foods.findIndex(
      editAvailabilityFood => editAvailabilityFood.id === id,
    );

    const response = await api.put(`/foods/${id}`, {
      ...foods[foodIndex],
      available: !foods[foodIndex].available,
    });

    const updatedFood = response.data;

    listFood.splice(foodIndex, 1, updatedFood);

    setFoods([...listFood]);
  }

  return (
    <>
      <Header openModal={toggleModal} />
      <ModalAddFood
        isOpen={modalOpen}
        setIsOpen={toggleModal}
        handleAddFood={handleAddFood}
      />
      <ModalEditFood
        isOpen={editModalOpen}
        setIsOpen={toggleEditModal}
        editingFood={editingFood}
        handleUpdateFood={handleUpdateFood}
      />

      <FoodsContainer data-testid="foods-list">
        {foods &&
          foods.map(food => (
            <Food
              key={food.id}
              food={food}
              handleDelete={handleDeleteFood}
              handleEditFood={handleEditFood}
              handleEditAvailability={handleEditAvailability}
            />
          ))}
      </FoodsContainer>
    </>
  );
};

export default Dashboard;
