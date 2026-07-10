from flask import Flask, request, jsonify
from flask_cors import CORS
from config import Config
from models import db, Product

app = Flask(__name__)
app.config.from_object(Config)

CORS(app)

db.init_app(app)

# Create tables
with app.app_context():
    db.create_all()


# Home Route
@app.route("/")
def home():
    return {"message": "Product Catalog Backend Running"}


# Get All Products
@app.route("/products", methods=["GET"])
def get_products():
    products = Product.query.all()
    return jsonify([product.to_dict() for product in products])


# Add Product
@app.route("/products", methods=["POST"])
def add_product():
    data = request.json

    product = Product(
        name=data["name"],
        category=data["category"],
        price=data["price"],
        stock=data["stock"]
    )

    db.session.add(product)
    db.session.commit()

    return jsonify({
        "message": "Product added successfully!"
    }), 201


# Update Product
@app.route("/products/<int:id>", methods=["PUT"])
def update_product(id):
    product = Product.query.get(id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    data = request.json

    product.name = data["name"]
    product.category = data["category"]
    product.price = data["price"]
    product.stock = data["stock"]

    db.session.commit()

    return jsonify({
        "message": "Product updated successfully!"
    })


# Delete Product
@app.route("/products/<int:id>", methods=["DELETE"])
def delete_product(id):
    product = Product.query.get(id)

    if not product:
        return jsonify({"message": "Product not found"}), 404

    db.session.delete(product)
    db.session.commit()

    return jsonify({
        "message": "Product deleted successfully!"
    })


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000, debug=True)
