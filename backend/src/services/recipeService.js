const recipeCatalog = [
  {
    name: 'Veggie Omelette',
    ingredients: ['Eggs', 'Milk', 'Onion', 'Tomato'],
    instructions: 'Whisk eggs and milk, sauté veggies, and cook together in a pan.'
  },
  {
    name: 'Pasta Marinara',
    ingredients: ['Pasta', 'Tomato', 'Garlic', 'Olive Oil'],
    instructions: 'Boil pasta and simmer tomato, garlic, and oil for sauce.'
  },
  {
    name: 'Banana Smoothie',
    ingredients: ['Banana', 'Milk', 'Honey'],
    instructions: 'Blend all ingredients until smooth.'
  },
  {
    name: 'Chicken Stir Fry',
    ingredients: ['Chicken', 'Onion', 'Bell Pepper', 'Soy Sauce'],
    instructions: 'Cook chicken and vegetables, then add soy sauce.'
  }
];

export const suggestRecipes = (products) => {
  const available = new Set(
    products
      .filter((product) => product.quantity > 0)
      .map((product) => product.name.toLowerCase())
  );

  return recipeCatalog
    .map((recipe) => {
      const ingredientsInStock = recipe.ingredients.filter((ingredient) =>
        available.has(ingredient.toLowerCase())
      );

      return {
        ...recipe,
        ingredientsInStock,
        missingIngredients: recipe.ingredients.filter(
          (ingredient) => !available.has(ingredient.toLowerCase())
        ),
        matchScore: ingredientsInStock.length / recipe.ingredients.length
      };
    })
    .filter((recipe) => recipe.matchScore >= 0.5)
    .sort((a, b) => b.matchScore - a.matchScore);
};
