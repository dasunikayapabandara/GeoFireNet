import logging
import sys

def get_logger(name: str) -> logging.Logger:
    """Provides a single, structured logging interface globally."""
    logger = logging.getLogger(name)
    
    # Avoid duplicating handlers if this gets called multiple times
    if not logger.hasHandlers():
        logger.setLevel(logging.INFO)
        
        handler = logging.StreamHandler(sys.stdout)
        
        formatter = logging.Formatter(
            '[%(asctime)s] %(levelname)s in %(module)s: %(message)s'
        )
        handler.setFormatter(formatter)
        logger.addHandler(handler)
        
    return logger

logger = get_logger("geofirenet")
